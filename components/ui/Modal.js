"use client"

import { useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const previousFocusRef = useRef(null)

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }

  const handleEscape = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
      setTimeout(() => {
        const firstInput = panelRef.current?.querySelector("input, textarea, select, button")
        if (firstInput) firstInput.focus()
      }, 50)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={panelRef}
        className={`relative w-full ${sizeClasses[size]} bg-card rounded-xl shadow-2xl max-h-[90vh] flex flex-col`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 id="modal-title" className="text-lg font-semibold text-primary">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-secondary hover:text-primary hover:bg-background transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-6 py-4 flex-1">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export default Modal
