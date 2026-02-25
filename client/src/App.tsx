import { useEffect, useState } from 'react'
import './App.css'
import { $api } from './utils/axios.instance'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import type { User } from './types'

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [user, setUser] = useState<User | null>(null)


  useEffect(()=> {
    $api('/status')
     .then(res => {
      console.log(res.data);
     })
  }, [])

  // if (isLoading) {
  //   return <div>Loading</div>
  // }

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
