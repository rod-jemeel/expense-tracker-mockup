"use client"

import { useState, useEffect } from "react"

/**
 * Hook to detect if component has mounted on client.
 * Use to prevent hydration mismatches when rendering
 * content that depends on client-side state.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
