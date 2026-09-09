"use client"

const TransactionSkeleton = () => {
  return (
    <div className="bg-card rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-background rounded w-32" />
          <div className="h-5 bg-background rounded-full w-16" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-24" />
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="h-4 bg-background rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

export default TransactionSkeleton
