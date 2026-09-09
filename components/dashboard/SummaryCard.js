const SummaryCard = ({ label, value, sublabel, accent, icon }) => {
  const accentClass = accent || "text-primary"

  return (
    <div className="bg-card rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-secondary">{label}</p>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentClass.replace("text-", "bg-").replace("-600", "-50").replace("-500", "-50")} ${accentClass}`}>
            {icon}
          </div>
        )}
      </div>
      <p className={`text-2xl font-bold ${accentClass}`}>{value}</p>
      {sublabel && <p className="text-xs text-secondary mt-1">{sublabel}</p>}
    </div>
  )
}

export default SummaryCard