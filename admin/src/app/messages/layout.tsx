import { requireAuth } from '@/lib/auth';
import Sidebar from '@/components/sidebar';

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
