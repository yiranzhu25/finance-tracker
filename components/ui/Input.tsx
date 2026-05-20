import React, { useState } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export default function Input({
  label,
  error,
  hint,
  id,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false)
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '13px',
            color: 'var(--secondary-label)',
            fontWeight: '500',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          props.onBlur?.(e)
        }}
        style={{
          height: '40px',
          borderRadius: '8px',
          border: `1px solid ${error ? 'var(--system-red)' : focused ? 'var(--system-blue)' : 'var(--system-gray4)'}`,
          boxShadow: focused
            ? error
              ? '0 0 0 3px rgba(255, 59, 48, 0.15)'
              : '0 0 0 3px rgba(0, 122, 255, 0.15)'
            : 'none',
          padding: '0 12px',
          fontSize: '15px',
          outline: 'none',
          width: '100%',
          backgroundColor: 'var(--system-background)',
          color: 'var(--label)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          ...style,
        }}
        {...props}
      />
      {error && (
        <p style={{ fontSize: '12px', color: 'var(--system-red)' }}>{error}</p>
      )}
      {hint && !error && (
        <p style={{ fontSize: '12px', color: 'var(--system-gray)' }}>{hint}</p>
      )}
    </div>
  )
}
