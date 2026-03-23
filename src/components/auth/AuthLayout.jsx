import React from 'react'

const AuthLayout = ({ children, title, description }) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#010204' }}
    >
      {/* Ambient cyan vignette top */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 30% at 50% 0%, rgba(0,229,255,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-10">
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00e5ff',
              boxShadow: '0 0 12px #00e5ff',
              margin: '0 auto 12px',
            }}
          />
          <h1
            className="font-heading"
            style={{
              fontSize: '11px',
              letterSpacing: '0.5em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 300,
              marginBottom: '6px',
            }}
          >
            The Human Catalyst Beacon
          </h1>
          <p
            style={{
              fontSize: '8px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              fontWeight: 300,
            }}
          >
            Your journey to transformation begins here
          </p>
        </div>

        {/* Glass card */}
        <div
          style={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 0 80px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Inner cyan aura */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(0,229,255,0.04) 0%, transparent 60%)',
              borderRadius: 'inherit',
            }}
          />

          {/* Card header */}
          {(title || description) && (
            <div className="text-center mb-8 relative">
              {title && (
                <h2
                  style={{
                    fontSize: '11px',
                    fontWeight: 300,
                    letterSpacing: '0.4em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: description ? '8px' : 0,
                    fontStyle: 'italic',
                  }}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  style={{
                    fontSize: '8px',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.3)',
                    fontWeight: 300,
                  }}
                >
                  {description}
                </p>
              )}
              <div
                style={{
                  height: '1px',
                  background: 'rgba(255,255,255,0.05)',
                  marginTop: '24px',
                }}
              />
            </div>
          )}

          <div className="relative">{children}</div>
        </div>

        <div
          className="text-center mt-6"
          style={{
            fontSize: '7px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
          }}
        >
          © 2024 The Human Catalyst Beacon. All rights reserved.
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
