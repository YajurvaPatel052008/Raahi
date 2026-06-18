export default function VerifyEmailPage() {
  return (
    <div className="auth-page">
      <div className="auth-container" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>📬</div>
        <div className="auth-brand">
          <span className="brand-logo">RAAHI</span>
          <h1 className="auth-title">Check your inbox!</h1>
          <p className="auth-subtitle">
            We sent a verification link to your college email. Click it to activate your account and start exploring.
          </p>
        </div>
        <div className="card" style={{ marginTop: '24px', textAlign: 'left' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            Didn&apos;t receive it? Check your <strong>spam folder</strong> or make sure you signed up with a valid <strong>@aitr.ac.in</strong> or <strong>@acropolis.in</strong> email.
          </p>
        </div>
        <a href="/login" className="btn btn-outline w-full" style={{ marginTop: '24px', display: 'block' }}>
          Back to Sign In
        </a>
      </div>
    </div>
  )
}
