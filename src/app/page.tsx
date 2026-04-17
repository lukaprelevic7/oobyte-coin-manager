'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const name = username.toLowerCase().trim()

    if (name === 'admin') {
      router.push('/admin')
    } else if (name === 'test_user_01') {
      router.push('/user')
    } else {
      setError('Invalid username. Try "admin" or "test_user_01"')
    }
  }

  return (
    <div style={{ 
      backgroundColor: '#0f172a', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'sans-serif',
      color: 'white' 
    }}>
      <div style={{ 
        background: '#1e293b', 
        padding: '40px', 
        borderRadius: '16px', 
        border: '1px solid #334155', 
        width: '100%', 
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      }}>
        <h1 style={{ color: '#38bdf8', marginBottom: '10px' }}>Oobyte Network</h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Please sign in to your account</p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              marginBottom: '15px', 
              borderRadius: '8px', 
              border: '1px solid #334155', 
              background: '#0f172a', 
              color: 'white',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          
          {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '15px' }}>{error}</p>}

          <button
            type="submit"
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#38bdf8', 
              color: '#0f172a', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            SIGN IN
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#64748b' }}>
          Hint: Use "admin" or "test_user_01"
        </div>
      </div>
    </div>
  )
}
