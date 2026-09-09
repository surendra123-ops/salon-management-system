"use client"

const SkeletonCard = () => {
  return (
    <div className="bg-card rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-44 bg-background" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-background rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-6 bg-background rounded w-1/4 mt-2" />
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
          <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonCard
