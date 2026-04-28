import { promises as fs } from 'fs';
import path from 'path';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readMinutes: number;
  cover: string;
  body: string;
}

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { data: {}, content: raw };
  const data: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    data[k] = v;
  }
  return { data, content: m[2] };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  let entries: string[] = [];
  try {
    entries = await fs.readdir(BLOG_DIR);
  } catch { return []; }
  const posts: BlogPost[] = [];
  for (const name of entries) {
    if (!name.endsWith('.md')) continue;
    const raw = await fs.readFile(path.join(BLOG_DIR, name), 'utf8');
    const { data, content } = parseFrontmatter(raw);
    posts.push({
      slug: name.replace(/\.md$/, ''),
      title: data.title ?? name,
      description: data.description ?? '',
      date: data.date ?? '',
      category: data.category ?? '',
      readMinutes: Number(data.readMinutes ?? '5'),
      cover: data.cover ?? '📄',
      body: content,
    });
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  return (await getAllPosts()).find((p) => p.slug === slug) ?? null;
}

// Minimal Markdown renderer (no external deps) — handles headings, lists,
// tables, paragraphs, links, bold, em, hr, code spans, and quote blocks.
export function renderMarkdown(md: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    let line = lines[i];

    // Horizontal rule
    if (/^\s*---\s*$/.test(line)) { out.push('<hr/>'); i += 1; continue; }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i += 1; continue;
    }

    // Tables
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s|:-]+\|?\s*$/.test(lines[i + 1])) {
      const headers = line.split('|').map((c) => c.trim()).filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(lines[i].split('|').map((c) => c.trim()).filter(Boolean));
        i += 1;
      }
      out.push(`<table><thead><tr>${headers.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }

    // Lists
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`);
        i += 1;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`);
        i += 1;
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // Blank line
    if (line.trim() === '') { i += 1; continue; }

    // Paragraph (collect consecutive non-empty lines)
    const para: string[] = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,6}\s|---|\s*[-*]\s|\s*\d+\.\s|\|)/.test(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }

  function inline(s: string): string {
    let t = escape(s);
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    return t;
  }

  return out.join('\n');
}
