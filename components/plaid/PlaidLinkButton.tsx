'use client'

import { useCallback, useState } from 'react'
import { usePlaidLink } from 'react-plaid-link'

interface PlaidLinkButtonProps {
  onSuccess?: () => void
}

export default function PlaidLinkButton({ onSuccess }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLinkToken = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/plaid/create-link-token', { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setLinkToken(data.link_token)
    } catch (e) {
      setError('Failed to start bank connection. Check your Plaid credentials.')
      setLoading(false)
    }
  }

  const handleSuccess = useCallback(
    async (public_token: string, metadata: { institution?: { institution_id?: string; name?: string } | null }) => {
      setLoading(true)
      try {
        const res = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_token,
            institution_id: metadata.institution?.institution_id ?? null,
            institution_name: metadata.institution?.name ?? null,
          }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        // Pull in transactions for the newly connected institution
        await fetch('/api/plaid/sync', { method: 'POST' })
        onSuccess?.()
      } catch (e) {
        setError('Failed to link account. Please try again.')
      } finally {
        setLoading(false)
        setLinkToken(null)
      }
    },
    [onSuccess]
  )

  const { open, ready } = usePlaidLink({
    token: linkToken ?? '',
    onSuccess: handleSuccess,
    onExit: () => {
      setLinkToken(null)
      setLoading(false)
    },
  })

  // Once we have a token and Link is ready, open it
  if (linkToken && ready) {
    open()
  }

  return (
    <div>
      <button
        onClick={fetchLinkToken}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 16px',
          height: '40px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: loading ? 'var(--system-gray4)' : 'var(--system-blue)',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.1s',
        }}
      >
        {loading ? 'Connecting…' : '+ Connect Account'}
      </button>
      {error && (
        <p style={{ fontSize: '13px', color: 'var(--system-red)', marginTop: '8px' }}>
          {error}
        </p>
      )}
    </div>
  )
}
