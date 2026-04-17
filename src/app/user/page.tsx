'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function UserPage() {
  const [userData, setUserData] = useState<any>(null)
  const [oobyteRate, setOobyteRate] = useState(0)
  const [coinRate, setCoinRate] = useState(0)
  const [calcAmount, setCalcAmount] = useState(0)
  const [calcType, setCalcType] = useState('OOB')
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const { data: stats } = await supabase.from('system_stats').select('label, value')
    if (stats) {
      setOobyteRate(stats.find(s => s.label === 'oobyte_eur_rate')?.value || 0)
      setCoinRate(stats.find(s => s.label === 'coin_eur_rate')?.value || 0)
    }

    const { data: user } = await supabase.from('users').select('*').eq('username', 'test_user_01').single()
    if (user) setUserData(user)

    const { data: logs } = await supabase.from('transaction_history').select('*').order('created_at', { ascending: false }).limit(5)
    if (logs) setHistory(logs)
    
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <div style={{padding: '40px', color: '#38bdf8', backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>📡 Securely loading wallet...</div>

  const estimatedValue = calcType === 'OOB' ? calcAmount * oobyteRate : calcAmount * coinRate

  return (
    <div style={{ padding: '40px', backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto 40px auto' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>MY <span style={{color: '#38bdf8'}}>WALLET</span></h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0 0' }}>Active Session: {userData?.username}</p>
        </div>
        <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', border: '1px solid #334155', padding: '8px 20px', borderRadius: '8px' }}>Logout</Link>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          
          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '30px', borderRadius: '20px', border: '1px solid #334155' }}>
            <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Oobyte Balance</h3>
            <p style={{ fontSize: '42px', fontWeight: 'bold', margin: '15px 0', color: '#38bdf8' }}>{userData?.oobyte_balance?.toLocaleString()}</p>
            <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', color: '#38bdf8', fontSize: '14px' }}>
              ≈ €{(userData?.oobyte_balance * oobyteRate).toLocaleString()} EUR
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '30px', borderRadius: '20px', border: '1px solid #334155' }}>
            <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Coin Balance</h3>
            <p style={{ fontSize: '42px', fontWeight: 'bold', margin: '15px 0', color: '#f59e0b' }}>{userData?.coin_balance?.toLocaleString()}</p>
            <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: '#f59e0b', fontSize: '14px' }}>
              ≈ €{(userData?.coin_balance * coinRate).toLocaleString()} EUR
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
          <section style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#94a3b8' }}>EUR CALCULATOR</h3>
            <select 
              onChange={(e) => setCalcType(e.target.value)}
              style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}
            >
              <option value="OOB">Oobyte</option>
              <option value="COIN">Coin</option>
            </select>
            <input 
              type="number" 
              placeholder="Amount"
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '12px', borderRadius: '8px', boxSizing: 'border-box' }}
            />
            <div style={{ marginTop: '20px', textAlign: 'center', padding: '20px', background: '#0f172a', borderRadius: '12px', border: '1px dashed #334155' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Estimated EUR Value</span>
              <h2 style={{ margin: '5px 0', color: '#10b981' }}>€ {estimatedValue.toLocaleString()}</h2>
            </div>
          </section>

          <section style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#94a3b8' }}>RECENT ACTIVITY</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((log) => (
                <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px', fontSize: '13px', paddingBottom: '12px', borderBottom: '1px solid #0f172a' }}>
                  <span style={{ color: log.action_type.includes('GIFT') ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{log.action_type}</span>
                  <span style={{ color: 'white' }}>{log.amount} Units</span>
                  <span style={{ color: '#64748b', textAlign: 'right' }}>{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
