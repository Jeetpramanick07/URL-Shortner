import { Link } from 'react-router-dom'
import { Orbit } from 'lucide-react'

export default function NotFoundPage() {
  return <div className="not-found"><div className="brand-mark large"><Orbit size={34} /></div><div className="eyebrow">404</div><h1>Page not found</h1><p>The requested LinkOrbit page does not exist.</p><Link className="button primary" to="/">Return to dashboard</Link></div>
}
