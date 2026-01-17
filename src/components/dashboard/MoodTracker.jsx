import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import ModernCard from './ModernCard'
import { Heart, Moon, AlertCircle, Plus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'
import { getLocalDateString, getFirstDayOfMonth, getLastDayOfMonth, isToday } from '../../utils/dateUtils'
import './MoodTracker.css'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="mood-tracker-tooltip">
        <p className="mood-tracker-tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: <span style={{ fontWeight: 'bold' }}>{entry.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

const MoodTracker = ({ userId }) => {
  const [entries, setEntries] = useState({})
  const [loading, setLoading] = useState(true)
  const [showInputModal, setShowInputModal] = useState(false)
  const cardRef = useRef(null)
  const chartContainerRef = useRef(null)
  const [chartWidth, setChartWidth] = useState(800)
  const [timeRange, setTimeRange] = useState('month') // 'week', 'month', 'year'
  const [todayEntry, setTodayEntry] = useState({
    mood: 5,
    sleep: 5,
    stress: 5
  })
  const [editingDate, setEditingDate] = useState(null)

  // Mesure la largeur du conteneur
  useEffect(() => {
    const updateWidth = () => {
      if (chartContainerRef.current) {
        setChartWidth(chartContainerRef.current.offsetWidth)
      }
    }
    
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const getCurrentRangeDays = () => {
    const days = []
    const today = new Date()
    
    if (timeRange === 'week') {
      // Last 7 days ending today
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const dateStr = getLocalDateString(date)
        days.push({
          date: dateStr,
          day: date.getDate(),
          dayLabel: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        })
      }
    } else {
      // Current month from day 1 to last day
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(today.getFullYear(), today.getMonth(), day)
        const dateStr = getLocalDateString(date)
        days.push({
          date: dateStr,
          day: day,
          dayLabel: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
        })
      }
    }
    
    return days
  }

  const days = getCurrentRangeDays()

  // Transform data for the chart - Ne PAS filtrer les null
  const chartData = days.map(day => {
    const entry = entries[day.date]
    return {
      date: day.dayLabel,
      Mood: entry?.mood ?? null,
      Sleep: entry?.sleep ?? null,
      Stress: entry?.stress ?? null
    }
  })

  const hasData = Object.keys(entries).length > 0

  // DEBUG - Vérifie ce qui est passé au graphique
  console.log('Entries:', entries)
  console.log('Chart Data:', chartData)
  console.log('Has Data:', hasData)
  
  // Pour la vue semaine : ne garder que les jours avec données
  // Pour la vue mois : garder TOUS les jours du mois
  const displayData = timeRange === 'week' 
    ? chartData.filter(item => item.Mood !== null || item.Sleep !== null || item.Stress !== null)
    : chartData  // Afficher tous les jours du mois même sans données
  
  console.log('Display Data:', displayData)

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      
      const authenticatedUserId = session.user.id
      
      // Calculate date range based on timeRange
      const today = new Date()
      let startDate, endDate
      
      if (timeRange === 'week') {
        // Last 7 days ending today
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 6)
        endDate = today
      } else {
        // Current month from first to last day
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      }
      
      const startDateStr = getLocalDateString(startDate)
      const endDateStr = getLocalDateString(endDate)

      const { data, error } = await supabase
        .from('user_daily_tracking')
        .select('*')
        .eq('user_id', authenticatedUserId)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true })

      if (error) throw error

      const entriesMap = {}
      data?.forEach(entry => {
        const localDateKey = getLocalDateString(new Date(entry.date)) || entry.date;
        entriesMap[localDateKey] = {
          mood: entry.mood,
          sleep: entry.sleep,
          stress: entry.stress
        }
      })
      setEntries(entriesMap)
    } catch (error) {
      console.error('Error loading mood entries:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, timeRange])

  useEffect(() => {
    if (userId) loadEntries()
  }, [userId, loadEntries, timeRange])

  const handleSaveEntry = async (date) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { error } = await supabase
        .from('user_daily_tracking')
        .upsert({
          user_id: session.user.id,
          date: date,
          mood: todayEntry.mood,
          sleep: todayEntry.sleep,
          stress: todayEntry.stress,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,date' })

      if (error) throw error
      toast.success('Entry saved!')
      setShowInputModal(false)
      loadEntries()
    } catch (error) {
      toast.error('Failed to save entry')
    }
  }

  const handleDayClick = (day) => {
    const existingEntry = entries[day.date]
    setTodayEntry(existingEntry ? {
      mood: existingEntry.mood || 5,
      sleep: existingEntry.sleep || 5,
      stress: existingEntry.stress || 5
    } : { mood: 5, sleep: 5, stress: 5 })
    setEditingDate(day.date)
    setShowInputModal(true)
  }

  if (loading) {
    return (
      <ModernCard className="mood-tracker-card min-h-[400px]">
        <div className="mood-tracker-loading">Loading mood tracker...</div>
      </ModernCard>
    )
  }

  return (
    <div ref={cardRef} className="mood-tracker-wrapper">
      <ModernCard className="mood-tracker-card min-h-[400px]">
        <div className="mood-tracker-header flex justify-between items-center mb-6">
          <h3 className="mood-tracker-title font-heading tracking-widest text-sm uppercase">
            DAILY TRACKER
          </h3>
          
          <div className="flex items-center gap-4">
            {/* Time Range Filter */}
            <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg p-1">
              {['week', 'month'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs uppercase tracking-wider rounded transition-all ${
                    timeRange === range 
                      ? 'bg-primary text-primary-foreground font-semibold' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {range === 'week' ? '7D' : '1M'}
                </button>
              ))}
            </div>
            
            <div className="hidden sm:flex items-center gap-3 text-[10px] uppercase tracking-wider text-gray-500">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10B981]"></div> Mood</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div> Sleep</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#EF4444]"></div> Stress</div>
            </div>
            <button
              className="mood-tracker-add-btn p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              onClick={() => handleDayClick({ date: getLocalDateString() })}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div ref={chartContainerRef} className="mood-tracker-chart-wrapper w-full" style={{ height: '320px', overflow: 'hidden' }}>
          {hasData ? (
            <div style={{ width: '100%', height: '100%' }}>
              <LineChart 
                data={displayData} 
                width={chartWidth}
                height={320}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  className="mood-tracker-grid-line"
                />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                  allowDataOverflow={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="Mood" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4, className: 'mood-tracker-dot-mood' }}
                  activeDot={{ r: 6 }}
                  className="mood-tracker-line-mood"
                  connectNulls
                />
                <Line 
                  type="monotone" 
                  dataKey="Sleep" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4, className: 'mood-tracker-dot-sleep' }}
                  activeDot={{ r: 6 }}
                  className="mood-tracker-line-sleep"
                  connectNulls
                />
                <Line 
                  type="monotone" 
                  dataKey="Stress" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4, className: 'mood-tracker-dot-stress' }}
                  activeDot={{ r: 6 }}
                  className="mood-tracker-line-stress"
                  connectNulls
                />
              </LineChart>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 text-sm italic">
              <div className="mb-2 opacity-20"><Plus size={40} /></div>
              No data for this month. Start tracking your journey!
            </div>
          )}
        </div>
      </ModernCard>

      {/* Input Modal */}
      {showInputModal && createPortal(
        <div className="mood-tracker-modal-overlay" onClick={() => setShowInputModal(false)}>
          <div className="mood-tracker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mood-tracker-modal-header border-b border-white/5 p-5 flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {isToday(editingDate) ? "Today's Status" : new Date(editingDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
              <button onClick={() => setShowInputModal(false)} className="opacity-50 hover:opacity-100">×</button>
            </div>

            <div className="mood-tracker-modal-content p-6 space-y-8">
              {[
                { label: 'Mood', icon: Heart, key: 'mood', color: '#10B981' },
                { label: 'Sleep', icon: Moon, key: 'sleep', color: '#3B82F6' },
                { label: 'Stress', icon: AlertCircle, key: 'stress', color: '#EF4444' }
              ].map(item => (
                <div key={item.key} className="mood-tracker-input-group space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <item.icon size={16} style={{ color: item.color }} />
                    {item.label}
                    <span className="ml-auto text-lg font-bold" style={{ color: item.color }}>{todayEntry[item.key]}</span>
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={todayEntry[item.key]}
                    onChange={(e) => setTodayEntry({ ...todayEntry, [item.key]: parseInt(e.target.value) })}
                    className={`mood-tracker-slider mood-tracker-slider-${item.key} w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer`}
                  />
                </div>
              ))}
            </div>

            <div className="mood-tracker-modal-actions p-6 pt-0">
              <button
                className="mood-tracker-save-btn w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all shadow-lg"
                onClick={() => handleSaveEntry(editingDate)}
              >
                Save Daily Entry
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default MoodTracker