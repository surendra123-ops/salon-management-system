"use client"

const TransactionActions = ({ id }) => {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => window.print()}
        className="px-4 py-2 border border-gray-300 text-secondary rounded-md hover:bg-background font-medium"
      >
        Print Receipt
      </button>
      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 text-secondary hover:text-primary"
      >
        Back
      </button>
    </div>
  )
}

export default TransactionActions
