import React, { useCallback } from 'react'
import Particles from 'react-tsparticles'
import { loadSlim } from 'tsparticles-slim'

const CosmicLoader = ({ fullScreen = true, message = "Loading your journey..." }) => {
  const containerClass = fullScreen 
    ? "fixed inset-0 z-50 flex items-center justify-center" 
    : "flex items-center justify-center w-full h-full"

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine)
  }, [])

  const particlesConfig = {
    fullScreen: false,
    background: {
      color: {
        value: "#0a0a0a"
      }
    },
    fpsLimit: 60,
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: ["#10b981", "#14b8a6", "#f59e0b", "#f97316"]
      },
      shape: {
        type: "circle"
      },
      opacity: {
        value: 0.5,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.1,
          sync: false
        }
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 0.5,
          sync: false
        }
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#10b981",
        opacity: 0.3,
        width: 1.5
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: {
          enable: true,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "grab"
        },
        onclick: {
          enable: true,
          mode: "push"
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 200,
          line_linked: {
            opacity: 0.5
          }
        },
        push: {
          particles_nb: 4
        }
      }
    },
    retina_detect: true
  }

  return (
    <div className={containerClass} style={{ background: '#0a0a0a' }}>
      {/* Particles background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesConfig}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      />

      {/* Center logo and text */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo container with glow */}
        <div className="relative">
          {/* Glow effect */}
          <div 
            className="absolute inset-0 -m-8 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
              filter: 'blur(40px)',
              animation: 'pulse 3s ease-in-out infinite'
            }}
          />
          
          {/* Logo */}
          <img 
            src="/hc-logo.svg" 
            alt="HC University" 
            className="relative w-32 h-32 object-contain"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.5))',
              animation: 'float 3s ease-in-out infinite'
            }}
          />
        </div>

        {/* Loading text */}
        <div className="text-center space-y-4">
          <p 
            className="text-white/90 text-xl font-light tracking-[0.3em] uppercase"
            style={{
              textShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
              animation: 'fadeInOut 2s ease-in-out infinite'
            }}
          >
            {message}
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-emerald-500/80"
                style={{
                  animation: `bounce 1.4s ease-in-out infinite ${i * 0.2}s`,
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default CosmicLoader

