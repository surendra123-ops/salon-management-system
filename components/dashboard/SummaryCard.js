const SummaryCard = ({ label, value, sublabel, accent }) => {
  const accentClass = accent || "text-gray-900"

  return (
    <div className="bg-white rounded-lg shadow-xl p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accentClass}`}>{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
    </div>
  )
}

export default SummaryCard