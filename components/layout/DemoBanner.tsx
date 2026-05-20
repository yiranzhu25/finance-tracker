export default function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return null

  return (
    <div
      style={{
        backgroundColor: 'var(--system-indigo)',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: '500',
        textAlign: 'center',
        padding: '6px 16px',
        letterSpacing: '0.01em',
        flexShrink: 0,
      }}
    >
      Demo Mode — sample data only · Built as a portfolio showcase
    </div>
  )
}
