import { Link } from 'react-router-dom'
import { Link2 } from 'lucide-react'
import Button from '../../components/common/Button'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <span className="brand-mark large"><Link2 size={30} /></span>
      <span className="eyebrow">404</span>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or may have been moved.</p>
      <Button as={Link} to="/">Return home</Button>
    </div>
  )
}
