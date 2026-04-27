'use client';

import { useEffect, useState } from 'react';
import { getPackages, createPackage, updatePackage, deletePackage, Package, PackageForm } from '@/lib/api';

function getToken() {
  return document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? '';
}

const empty: PackageForm = { name: '', pointsAmount: 0, priceSar: 0, profitMargin: 0, isActive: true, sortOrder: 0 };

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form, setForm] = useState<PackageForm>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const data = await getPackages(getToken());
      setPackages(data);
    } catch {
      setError('فشل تحميل الباقات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function openNew() {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  }

  function openEdit(pkg: Package) {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      pointsAmount: pkg.pointsAmount,
      priceSar: Number(pkg.priceSar),
      profitMargin: Number(pkg.profitMargin),
      isActive: pkg.isActive,
      sortOrder: pkg.sortOrder,
    });
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updatePackage(getToken(), editing.id, form);
      } else {
        await createPackage(getToken(), form);
      }
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(pkg: Package) {
    await updatePackage(getToken(), pkg.id, { isActive: !pkg.isActive });
    await load();
  }

  async function remove(pkg: Package) {
    if (!confirm(`هل تريد حذف باقة "${pkg.name}"؟`)) return;
    await deletePackage(getToken(), pkg.id);
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-navy">الباقات</h1>
          <p className="text-gray-500 text-sm">إدارة باقات النقاط والأسعار</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ إضافة باقة</button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-gray-400">جارٍ التحميل...</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">الاسم</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">النقاط</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">السعر (ريال)</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">هامش الربح</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">الترتيب</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">الحالة</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-navy">{pkg.name}</td>
                  <td className="px-6 py-4">{pkg.pointsAmount.toLocaleString('ar')} نقطة</td>
                  <td className="px-6 py-4">{Number(pkg.priceSar).toFixed(2)} ﷼</td>
                  <td className="px-6 py-4">{pkg.profitMargin}%</td>
                  <td className="px-6 py-4">{pkg.sortOrder}</td>
                  <td className="px-6 py-4">
                    <span className={pkg.isActive ? 'badge-success' : 'badge-failed'}>
                      {pkg.isActive ? 'مفعّل' : 'معطّل'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(pkg)} className="text-gold hover:underline text-xs">تعديل</button>
                      <button onClick={() => toggleActive(pkg)} className="text-gray-500 hover:underline text-xs">
                        {pkg.isActive ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button onClick={() => remove(pkg)} className="text-red-500 hover:underline text-xs">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-navy mb-4">
              {editing ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">اسم الباقة</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">عدد النقاط</label>
                  <input className="input" type="number" value={form.pointsAmount} onChange={(e) => setForm({ ...form, pointsAmount: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">السعر (ريال)</label>
                  <input className="input" type="number" step="0.01" value={form.priceSar} onChange={(e) => setForm({ ...form, priceSar: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">هامش الربح %</label>
                  <input className="input" type="number" value={form.profitMargin} onChange={(e) => setForm({ ...form, profitMargin: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الترتيب</label>
                  <input className="input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <label htmlFor="active" className="text-sm">مفعّل</label>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm mt-3">{error}</div>}

            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                {saving ? 'جارٍ الحفظ...' : 'حفظ'}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 hover:bg-gray-50">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
