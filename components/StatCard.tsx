interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  color?: 'blue' | 'green' | 'purple' | 'amber';
}

const colors = {
  blue:   'from-blue-500 to-blue-600',
  green:  'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  amber:  'from-amber-500 to-amber-600',
};

export default function StatCard({ label, value, sub, color = 'blue' }: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-3 text-white text-center shadow-sm`}>
      <p className="text-xs font-medium opacity-80 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-0.5">{value}</p>
      {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}
