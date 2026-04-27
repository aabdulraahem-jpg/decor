import Sidebar from '@/components/sidebar';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <main className="flex-1 p-8 overflow-x-hidden">{children}</main>
    </div>
  );
}
