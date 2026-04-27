/**
 * Client-side anti-abuse signals.
 *
 * All signals load asynchronously (no UI block). FingerprintJS is loaded
 * lazily so it never delays page render.
 */

const DEVICE_KEY = 'sufuf_device_id';
const SIGNED_KEY = 'sufuf_signed_id';

/** Stable random UUID per device — written to localStorage. */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

/**
 * Returns a SubtleCrypto-signed device ID. The keypair is generated once
 * and persisted in IndexedDB (extractable=false) so the SAME device always
 * produces the SAME signature — even after `localStorage.clear()` or
 * "Clear cache and cookies". Signing requires the private key, which
 * lives only in the browser's IndexedDB.
 */
export async function getSignedDeviceId(): Promise<string> {
  if (typeof window === 'undefined' || !crypto.subtle) return '';
  try {
    const cached = sessionStorage.getItem(SIGNED_KEY);
    if (cached) return cached;

    const db = await openIndexedDb();
    let key = await getKey(db);
    if (!key) {
      key = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        false, // not extractable — bound to this browser profile
        ['sign', 'verify'],
      );
      await putKey(db, key);
    }

    const deviceId = getDeviceId();
    const data = new TextEncoder().encode(`${deviceId}|sufuf-anti-abuse-v1`);
    const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key.privateKey, data);
    const sigHex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem(SIGNED_KEY, sigHex);
    return sigHex;
  } catch {
    return '';
  }
}

/**
 * Loads FingerprintJS open-source SDK lazily and returns the visitorId
 * (canvas + audio + fonts + WebGL). Cached per session.
 */
export async function getBrowserFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return '';
  try {
    const w = window as unknown as { __sufufVisitorId?: string };
    if (w.__sufufVisitorId) return w.__sufufVisitorId;
    const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
    const fp = await FingerprintJS.load({ delayFallback: 50 });
    const result = await fp.get();
    w.__sufufVisitorId = result.visitorId;
    return result.visitorId;
  } catch {
    return '';
  }
}

/** Convenience: gather all signals in parallel. Never throws. */
export async function gatherSecuritySignals(): Promise<{
  deviceId: string;
  signedDeviceId: string;
  visitorId: string;
}> {
  const deviceId = getDeviceId();
  const [signedDeviceId, visitorId] = await Promise.all([
    getSignedDeviceId().catch(() => ''),
    getBrowserFingerprint().catch(() => ''),
  ]);
  return { deviceId, signedDeviceId, visitorId };
}

// ── IndexedDB helpers (tiny, no library) ─────────────────────────────

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('sufuf-keys', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('keys')) db.createObjectStore('keys');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getKey(db: IDBDatabase): Promise<CryptoKeyPair | null> {
  return new Promise((resolve) => {
    const tx = db.transaction('keys', 'readonly');
    const req = tx.objectStore('keys').get('device-key');
    req.onsuccess = () => resolve((req.result as CryptoKeyPair | undefined) ?? null);
    req.onerror = () => resolve(null);
  });
}

function putKey(db: IDBDatabase, kp: CryptoKeyPair): Promise<void> {
  return new Promise((resolve) => {
    const tx = db.transaction('keys', 'readwrite');
    tx.objectStore('keys').put(kp, 'device-key');
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}
