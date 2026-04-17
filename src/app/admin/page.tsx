'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminPage() {
  const [oobyteRate, setOobyteRate] = useState<number>(0)
  const [coinRate, setCoinRate] = useState<number>(0)
  const [users, setUsers] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const { data: stats } = await supabase.from('system_stats').select('label, value')
    if (stats) {
      setOobyteRate(stats.find(s => s.label === 'oobyte_eur_rate')?.value || 0)
      setCoinRate(stats.find(s => s.label === 'coin_eur_rate')?.value || 0)
    }
    const { data: userData } = await supabase.from('users').select('*').order('username', { ascending: true })
    if (userData) setUsers(userData)
    const { data: logs } = await supabase.from('transaction_history').select('*').order('created_at', { ascending: false }).limit(10)
    if (logs) setHistory(logs)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const updateRate = async (label: string, newRate: number) => {
    await supabase.from('system_stats').update({ value: newRate }).eq('label', label)
    fetchData()
  }

  const adjustBalance = async (user: any, field: string, amount: number) => {
    const currency = field.includes('oobyte') ? 'OOB' : 'COIN'
    const action = amount > 0 ? `GIFT ${currency}` : `REDUCE ${currency}`
    await supabase.from('users').update({ [field]: user[field] + amount }).eq('id', user.id)
    await supabase.from('transaction_history').insert([{ action_type: action, amount: Math.abs(amount) }])
    fetchData()
  }

  if (loading) return <div style={{padding: '40px', color: '#38bdf8', backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>📡 Accessing Authority Terminal...</div>

  return (
    <div style={{ padding: '40px', backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto 40px auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.5px' }}>OOBYTE <span style={{color: '#38bdf8'}}>AUTHORITY</span></h1>
        <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', border: '1px solid #334155', padding: '8px 20px', borderRadius: '8px', transition: 'all 0.2s' }}>Logout</Link>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
        
        {/* LEFT COLUMN: USER MANAGEMENT */}
        <section style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #334155', background: '#1e293b' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#94a3b8' }}>USER ASSET CONTROL</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <th style={{ padding: '15px 20px' }}>Username</th>
                <th>Oobyte</th>
                <th>Coin</th>
                <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #0f172a' }}>
                  <td style={{ padding: '20px', fontWeight: '500' }}>{u.username}</td>
                  <td style={{ color: '#38bdf8', fontWeight: 'bold' }}>{u.oobyte_balance}</td>
                  <td style={{ color: '#f59e0b', fontWeight: 'bold' }}>{u.coin_balance}</td>
                  <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                      <button onClick={() => adjustBalance(u, 'oobyte_balance', 100)} style={{ padding: '6px 10px', background: '#38bdf8', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>+100 OOB</button>
                      <button onClick={() => adjustBalance(u, 'oobyte_balance', -100)} style={{ padding: '6px 10px', background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>-100</button>
                      <button onClick={() => adjustBalance(u, 'coin_balance', 10)} style={{ padding: '6px 10px', background: '#f59e0b', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>+10 COIN</button>
                      <button onClick={() => adjustBalance(u, 'coin_balance', -10)} style={{ padding: '6px 10px', background: 'transparent', border: '1px solid #f59e0b', color: '#f59e0b', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>-10</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* RIGHT COLUMN: RATES & LOGS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <section style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#94a3b8' }}>CONVERSION RATES</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '8px' }}>1 OOB = (EUR)</label>
                <input type="number" value={oobyteRate} onChange={(e) => updateRate('oobyte_eur_rate', Number(e.target.value))} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#38bdf8', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '8px' }}>1 COIN = (EUR)</label>
                <input type="number" value={coinRate} onChange={(e) => updateRate('coin_eur_rate', Number(e.target.value))} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f59e0b', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }} />
              </div>
            </div>
          </section>

          <section style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', border: '1px solid #334155', flexGrow: 1 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#94a3b8' }}>AUDIT LOG</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((log) => (
                <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px', fontSize: '13px', paddingBottom: '10px', borderBottom: '1px solid #334155' }}>
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
