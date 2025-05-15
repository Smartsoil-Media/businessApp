"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface PointsPopupProps {
  points: number
  message: string
  onComplete: () => void
}

export function PointsPopup({ points, message, onComplete }: PointsPopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 4000)

    return () => clearTimeout(timer)
  }, [points, message, onComplete])

  return (
    <AnimatePresence mode="wait" onExitComplete={() => onComplete()}>
      <motion.div
        key={`${points}-${message}`}
        className="fixed top-16 right-4 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.8 }}
        transition={{
          duration: 0.5,
          exit: { duration: 0.3 }
        }}
      >
        <motion.div
          className="text-xl font-bold"
          initial={{ scale: 0.5 }}
          animate={{ scale: [0.5, 1.2, 1] }}
          transition={{ duration: 0.5, times: [0, 0.6, 1] }}
        >
          +{points}
        </motion.div>
        <div className="text-sm">{message}</div>
      </motion.div>
    </AnimatePresence>
  )
}
