function StatCard({ label, value, color, bg }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 h-2 w-12 rounded-full ${bg}`} />
      <p className="text-sm font-semibold uppercase text-gray-600">{label}</p>
      <p className={`mt-2 text-4xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default StatCard;
