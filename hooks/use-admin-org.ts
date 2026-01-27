"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "admin-last-org-id"

/**
 * Hook for managing selected organization in Admin Hub.
 * Persists selection to localStorage for cross-session memory.
 */
export function useAdminOrg() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>("")
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setSelectedOrgId(stored)
    }
    setIsLoaded(true)
  }, [])

  const selectOrg = useCallback((orgId: string) => {
    setSelectedOrgId(orgId)
    if (orgId) {
      localStorage.setItem(STORAGE_KEY, orgId)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const clearOrg = useCallback(() => {
    setSelectedOrgId("")
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    selectedOrgId,
    selectOrg,
    clearOrg,
    isLoaded,
    hasSelection: Boolean(selectedOrgId),
  }
}
