import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import NotificationPopup from '../components/entry/IPhoneNotification'
import IncomingCall from '../components/entry/IPhoneIncomingCall'
import AnsweredCall from '../components/entry/IPhoneAnsweredCall'
import EntityScene from '../components/entry/EntityScene'
import TypingEffect from '../components/entry/TypingEffect'
import { Button } from '../components/ui/button'
import './MatrixEntryPage.css'

// Sons : fichiers dans public/assets/ (ou à la racine assets/ copiés vers public/assets/)
const CALL_AUDIO_URL = '/assets/Voix%202%20Entry.mp3'
const NOTIFICATION_SOUND_URL = '/assets/mixkit-message-pop-alert-2354.mp3'
const INCOMING_CALL_SOUND_URL = '/assets/11L-cellphone_ringing_vibrate-17172534.mp3'

// Generate simple notification sound using Web Audio API
const generateNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (err) {
    console.warn('Could not generate notification sound:', err)
  }
}

// Generate incoming call sound using Web Audio API
const generateIncomingCallSound = (audioContextRef) => {
  try {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    const audioContext = audioContextRef.current
    
    const oscillator1 = audioContext.createOscillator()
    const oscillator2 = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator1.connect(gainNode)
    oscillator2.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator1.frequency.value = 400
    oscillator2.frequency.value = 500
    oscillator1.type = 'sine'
    oscillator2.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
    
    oscillator1.start(audioContext.currentTime)
    oscillator2.start(audioContext.currentTime)
    
    // Stop after 2 seconds (will be looped by caller)
    setTimeout(() => {
      oscillator1.stop()
      oscillator2.stop()
    }, 2000)
    
    return { oscillator1, oscillator2, gainNode }
  } catch (err) {
    console.warn('Could not generate incoming call sound:', err)
    return null
  }
}

const MatrixEntryPage = () => {
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const [currentAct, setCurrentAct] = useState('act1') // act1 | act2 | act3
  const [popups, setPopups] = useState([])
  const [showAct1Text, setShowAct1Text] = useState(false)
  const [showAct2Text, setShowAct2Text] = useState(false)
  const [act1TypingComplete, setAct1TypingComplete] = useState(false)
  const [act2TypingComplete, setAct2TypingComplete] = useState(false)
  const [callStatus, setCallStatus] = useState('incoming') // 'incoming' | 'answered' | 'audioFinished' | 'finalMessage'

  const audioRef = useRef(null)
  const notificationSoundRef = useRef(null)
  const incomingCallSoundRef = useRef(null)
  const incomingCallOscillatorRef = useRef(null)
  const audioContextRef = useRef(null)

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  // Initialize audio elements on mount (chaque ref = un seul fichier)
  // IMPORTANT: notificationSoundRef et incomingCallSoundRef sont créés ici en JS (new Audio),
  // pas via <audio ref={...} />, pour éviter que React écrase la ref avec un élément sans src.
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'auto'
      audioRef.current.volume = 0.7
    }
    if (!notificationSoundRef.current) {
      notificationSoundRef.current = new Audio(NOTIFICATION_SOUND_URL)
      notificationSoundRef.current.preload = 'auto'
      notificationSoundRef.current.volume = 0.5
    }
    if (!incomingCallSoundRef.current) {
      incomingCallSoundRef.current = new Audio(INCOMING_CALL_SOUND_URL)
      incomingCallSoundRef.current.preload = 'auto'
      incomingCallSoundRef.current.loop = true
      incomingCallSoundRef.current.volume = 0.6
    }

    // Enable audio on first user interaction (browser autoplay policy)
    const enableAudio = async () => {
      try {
        if (notificationSoundRef.current) {
          await notificationSoundRef.current.play()
          notificationSoundRef.current.pause()
          notificationSoundRef.current.currentTime = 0
        }
      } catch (err) {
        // Autoplay bloqué, sera débloqué au premier clic
      }
    }

    const handleInteraction = async () => {
      await enableAudio()
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }

    enableAudio()
    document.addEventListener('click', handleInteraction, { once: true })
    document.addEventListener('touchstart', handleInteraction, { once: true })
    document.addEventListener('keydown', handleInteraction, { once: true })
  }, [])

  // Play sound helper with error handling (évite l'erreur "media resource not suitable")
  const playSound = (audioRef, url) => {
    return new Promise((resolve, reject) => {
      if (!audioRef) {
        reject(new Error('Missing audioRef'))
        return
      }
      
      const audio = audioRef.current
      if (!audio) {
        reject(new Error('Audio element not found'))
        return
      }
      
      audio.onerror = null
      
      // Ne changer la source que si nécessaire
      const currentSrc = (audio.src || '').split('?')[0]
      const urlBase = (url || '').split('?')[0]
      if (currentSrc !== urlBase && url) {
        audio.src = url
      }
      
      audio.onerror = () => {
        // Ne pas faire remonter l'erreur pour éviter l'overlay "media resource not suitable"
        if (url === NOTIFICATION_SOUND_URL) {
          generateNotificationSound()
        }
        reject(new Error('Audio file error'))
      }
      
      // Jouer
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => resolve())
          .catch(err => {
            document.addEventListener('click', () => audio.play().catch(() => {}), { once: true })
            document.addEventListener('touchstart', () => audio.play().catch(() => {}), { once: true })
            reject(err)
          })
      } else {
        resolve()
      }
    })
  }

  // Jouer uniquement le son d'appel entrant (sonnerie) — un seul ref dédié
  const playIncomingCallRing = () => {
    const audio = incomingCallSoundRef.current
    if (!audio) return
    audio.src = INCOMING_CALL_SOUND_URL
    audio.loop = true
    audio.volume = 0.6
    audio.currentTime = 0
    audio.play().catch(() => {
      // Fallback: son généré
      const id = setInterval(() => {
        if (callStatus !== 'incoming' || currentAct !== 'act3') {
          clearInterval(id)
          return
        }
        generateIncomingCallSound(audioContextRef)
      }, 2000)
      incomingCallOscillatorRef.current = id
    })
  }

  const stopIncomingCallRing = () => {
    if (incomingCallSoundRef.current) {
      incomingCallSoundRef.current.pause()
      incomingCallSoundRef.current.currentTime = 0
    }
    if (incomingCallOscillatorRef.current) {
      clearInterval(incomingCallOscillatorRef.current)
      incomingCallOscillatorRef.current = null
    }
  }

  /* =======================
     ACTE 1 — OVERLOAD
  ======================= */

  // Reset act1 state when leaving act1
  useEffect(() => {
    if (currentAct !== 'act1') {
      setShowAct1Text(false)
      setAct1TypingComplete(false)
    }
  }, [currentAct])

  useEffect(() => {
    if (currentAct !== 'act1') return

    // Reset state when entering act1
    setShowAct1Text(false)
    setAct1TypingComplete(false)

    const notificationsPool = [
      {
        app: 'TikTok',
        time: 'maintenant',
        title: 'TikTok',
        content: 'mf liked your video.',
        iconBg: 'bg-black',
        image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=120&h=120&fit=crop',
      },
      {
        app: 'Instagram',
        time: 'il y a 2 min',
        title: 'Instagram',
        content: '(noaverspeek): luuk.rademaker26 liked your post.',
        iconBg: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
      },
      {
        app: 'Messages',
        time: 'il y a 8 min',
        title: 'Jason',
        content: 'ngl',
        iconBg: 'bg-green-500',
        isMessage: true,
      },
      {
        app: 'System',
        time: 'maintenant',
        title: 'Security Alert',
        content: 'Suspicious activity detected.',
        iconBg: 'bg-red-500',
      },
      {
        app: 'Crypto',
        time: 'maintenant',
        title: 'Market Crash',
        content: 'BTC dropped 9% in 5 minutes.',
        iconBg: 'bg-yellow-500',
      },
    ]

    const spawnPopup = () => {
      const id = Date.now() + Math.random()
      const data = notificationsPool[Math.floor(Math.random() * notificationsPool.length)]
      const y = Math.random() * 70
      setPopups(prev => [...prev, { id, y, ...data }])
      // Play notification sound
      playSound(notificationSoundRef, NOTIFICATION_SOUND_URL).catch((err) => {
        console.log('Using fallback notification sound')
        generateNotificationSound()
      })
    }

    const runOverload = async () => {
      spawnPopup()
      await sleep(1200)  // Ralenti: 700 → 1200
      spawnPopup()
      spawnPopup()
      await sleep(1000)  // Ralenti: 600 → 1000
      for (let i = 0; i < 12; i++) {
        spawnPopup()
        await sleep(200)  // Ralenti: 90 → 200
      }

      await sleep(1500)  // Ralenti: 900 → 1500
      setPopups([])
      setShowAct1Text(true)
    }

    runOverload()
  }, [currentAct])

  const act1Texts = [
    'Did you notice?',
    'Were you overwhelmed... or entertained?',
    'You felt that dopamine hit.',
    "That's why you're stuck."
  ]

  /* =======================
     ACTE 2 — MOINE / VÉRITÉ
  ======================= */

  const act2Texts = [
    'No one is coming to save you.',
    'You are trapped — in addiction, information, and separation.',
    'And the system profits from it.'
  ]

  useEffect(() => {
    if (currentAct !== 'act2') {
      setShowAct2Text(false)
      setAct2TypingComplete(false)
      return
    }

    const runAct2Text = async () => {
      setShowAct2Text(true)
    }

    runAct2Text()
  }, [currentAct])

  // Jouer la sonnerie d'appel entrant en ACT 3
  useEffect(() => {
    if (currentAct === 'act3' && callStatus === 'incoming') {
      const t = setTimeout(playIncomingCallRing, 150)
      return () => clearTimeout(t)
    } else {
      stopIncomingCallRing()
    }
  }, [currentAct, callStatus])

  /* =======================
     ACTE 3 — APPEL
  ======================= */

  const handleRejectCall = () => {
    stopIncomingCallRing()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setCallStatus('declined')
  }

  const handleSkipToLanding = () => {
    navigate('/landing')
  }

  const handleAcceptCall = () => {
    stopIncomingCallRing()
    setCallStatus('answered')
    // Jouer la voix (call audio) et attendre la fin
    const callAudio = audioRef.current
    if (callAudio) {
      callAudio.src = CALL_AUDIO_URL
      callAudio.volume = 0.7
      
      callAudio.onended = () => {
        // Audio terminé → passer à l'état suivant
        setCallStatus('audioFinished')
      }
      
      callAudio.play().catch(() => {
        // Si erreur, passer quand même après délai
        setTimeout(() => setCallStatus('audioFinished'), 5000)
      })
    } else {
      // Pas d'audio → passer directement
      setCallStatus('audioFinished')
    }
  }

  // Navigation automatique après message final
  useEffect(() => {
    if (callStatus === 'audioFinished') {
      // Afficher message après 1s
      const timer = setTimeout(() => {
        setCallStatus('finalMessage')
      }, 1000)
      return () => clearTimeout(timer)
    }
    
    if (callStatus === 'finalMessage') {
      // Naviguer vers /landing après 2s
      const timer = setTimeout(() => {
        navigate('/landing')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [callStatus, navigate])

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="matrix-entry-page">
      <canvas id="matrix-canvas" ref={canvasRef} />
      <div className="glitch-noise"></div>

      {/* Skip button - visible on all acts */}
      <button type="button" className="matrix-entry-skip" onClick={handleSkipToLanding} aria-label="Skip to landing">
        SKIP
      </button>

      {/* ================= ACTE 1 ================= */}
      {currentAct === 'act1' && (
        <div className="screen active screen-act1">
          <div className="notif-layer">
            {popups.map(p => (
              <div
                key={p.id}
                className="notif-wrapper"
                style={{ top: `${p.y}%` }}
              >
                <NotificationPopup
                  app={p.app}
                  time={p.time}
                  title={p.title}
                  content={p.content}
                  iconBg={p.iconBg}
                  image={p.image}
                  isMessage={p.isMessage}
                />
              </div>
            ))}
          </div>

          {showAct1Text && (
            <div className="act1-text-container">
              <TypingEffect 
                lines={act1Texts}
                typingSpeed={50}
                deletionSpeed={30}
                pauseAfterLine={2000}
                onComplete={() => setAct1TypingComplete(true)}
              />

              {act1TypingComplete && (
                <Button 
                  variant="secondary" 
                  size="lg" 
                  onClick={() => setCurrentAct('act2')}
                  className="act1-cta-button"
                >
                  RELEASE MY CHAINS
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= ACTE 2 ================= */}
      {currentAct === 'act2' && (
        <div className="screen active screen-act2">
          <EntityScene />

          <div className="act2-centered">
            {showAct2Text && (
              <div className="act2-text-container">
                <TypingEffect 
                  lines={act2Texts}
                  typingSpeed={50}
                  deletionSpeed={30}
                  pauseAfterLine={2000}
                  onComplete={() => setAct2TypingComplete(true)}
                />
              </div>
            )}

            {act2TypingComplete && (
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => setCurrentAct('act3')}
                className="act2-cta-button"
              >
                WHAT'S THE FIRST STEP?
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ================= ACTE 3 ================= */}
      {currentAct === 'act3' && (
        <div className="screen active screen-act3">
          {callStatus === 'incoming' && (
            <IncomingCall 
              onAccept={handleAcceptCall}
              onDecline={handleRejectCall}
              callerPhoto="/assets/image-1105ab57-7722-40da-86ce-f8763e06e471.png"
            />
          )}
          
          {callStatus === 'answered' && (
            <AnsweredCall 
              callerName="Note"
              onEndCall={handleRejectCall}
            />
          )}
          
          {callStatus === 'declined' && (
            <div className="act3-final-message">
              <h2>Connection terminée</h2>
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={handleSkipToLanding}
                className="act3-rappeler-btn"
              >
                Rappeler
              </Button>
            </div>
          )}
          
          {callStatus === 'audioFinished' && (
            <div className="act3-final-message">
              <h2>Connection Finished</h2>
              <p>Rappelle toi c'est gratuit</p>
            </div>
          )}
        </div>
      )}
      
      {/* Hidden audio: seul audioRef est un élément DOM (pour l'audio d'appel). Les autres sont créés en JS dans useEffect pour garder la bonne source. */}
      <audio ref={audioRef} preload="auto" style={{ display: 'none' }} />
    </div>
  )
}

export default MatrixEntryPage
