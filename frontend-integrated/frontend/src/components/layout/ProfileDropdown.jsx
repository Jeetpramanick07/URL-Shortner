import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Settings, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function ProfileDropdown() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const initials = (user?.name || 'U').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="profile-dropdown" ref={ref}>
      <button className="profile-trigger" onClick={() => setOpen((v) => !v)}>
        <span className="avatar">{initials}</span>
        <span className="profile-copy">
          <strong>{user?.name || 'Account'}</strong>
          <small>{user?.email || ''}</small>
        </span>
      </button>
      {open && (
        <div className="profile-menu">
          <Link to="/settings" onClick={() => setOpen(false)}><User size={16} /> Profile</Link>
          <Link to="/settings" onClick={() => setOpen(false)}><Settings size={16} /> Settings</Link>
          <button onClick={logout}><LogOut size={16} /> Log out</button>
        </div>
      )}
    </div>
  )
}
