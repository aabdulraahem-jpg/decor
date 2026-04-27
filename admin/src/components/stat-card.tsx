interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  sub?: string;
  highlight?: boolean;
}

export default function StatCard({ label, value, icon, sub, highlight }: StatCardProps) {
  return (
    <div
      className={`card flex items-center gap-4 ${highlight ? 'border-gold bg-gold/5' : ''}`}
    >
      <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center text-2xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-gray-500 text-sm">{label}</div>
        <div className="text-2xl font-black text-navy mt-0.5">{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
