"use client"

import { useEffect } from 'react'
import { initScrollAnimations } from '@/lib/scroll-animations'

export default function ScrollAnimations() {
  useEffect(() => {
    const cleanup = initScrollAnimations()
    return cleanup
  }, [])

  return null
} 