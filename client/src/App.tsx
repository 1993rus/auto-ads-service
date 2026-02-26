import { useEffect, useState } from 'react'
import './App.css'
import { $api, setAccessToken } from './utils/axios.instance'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import type { User, AuthResponse } from './types'

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [user, setUser] = useState<User | null>(null)


  useEffect(()=> {
    // Попытка восстановить сессию через refresh token
    $api.get<AuthResponse>('/users/refresh')
     .then(res => {
      console.log('Session restored:', res.data);
      setAccessToken(res.data.accessToken)
      setUser(res.data.user)
     })
     .catch(err => {
      console.log('No active session:', err.response?.data || err.message);
     })
     .finally(() => {
      setIsLoading(false)
     })
  }, [])

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Загрузка...</div>
  }

  return (
    <>
      <Navbar user={ user } setUser={ setUser }/>
      <main>
        <Outlet context={{ user, setUser }}/>
      </main>
    </>
  )
}

export default App
