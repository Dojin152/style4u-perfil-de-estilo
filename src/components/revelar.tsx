'use client'

import { motion } from 'motion/react'

/**
 * Sections arrive instead of being there already. Once each, never on the way
 * back up, and the whole thing is a no-op for anyone who asked the system for
 * less motion.
 */
export function Revelar({
  children,
  atraso = 0,
  className,
}: {
  children: React.ReactNode
  atraso?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: atraso, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
