import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Globe2,
  Link2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'

const features = [
  {
    icon: RotateCcw,
    title: 'Rotating keyword links',
    description: 'Each human click advances through your keyword list in a strict cycle — no external services required.',
  },
  {
    icon: BarChart3,
    title: 'Real-time analytics',
    description: 'Track clicks, unique visitors, devices, operating systems, browsers and referrers as they happen.',
  },
  {
    icon: ShieldCheck,
    title: 'Bot & preview filtering',
    description: 'Automatically separates real human traffic from crawlers, prefetches and social-media previews.',
  },
  {
    icon: Globe2,
    title: 'Multi-domain routing',
    description: 'Serve links from as many custom domains as you need, each with independent branding.',
  },
  {
    icon: Zap,
    title: 'Instant 302 redirects',
    description: 'No visible intermediate page — visitors land on the Amazon product page immediately.',
  },
  {
    icon: Sparkles,
    title: 'Built for marketplaces',
    description: 'Native support for every major Amazon marketplace, from amazon.com to amazon.co.jp.',
  },
]

const benefits = [
  'Keep full ownership of your link data — self-hosted backend, no third-party lock-in.',
  'Privacy-preserving analytics that never store raw visitor IP addresses.',
  'A clean dashboard built for daily use, not just vanity metrics.',
]

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />

      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow hero-eyebrow"><Sparkles size={14} /> Smart links for Amazon sellers &amp; marketers</span>
          <h1>Shorten, rotate, and track every Amazon link in one place.</h1>
          <p>LinkOrbit turns any Amazon product into a branded, trackable smart link with rotating keywords and privacy-first analytics — so you always know what's converting.</p>
          <div className="hero-actions">
            <Button as={Link} to="/signup" size="lg" icon={ArrowRight}>Get started for free</Button>
            <Button as={Link} to="/login" variant="secondary" size="lg">Log in</Button>
          </div>
          <div className="hero-trust">
            <CheckCircle2 size={16} /> No credit card required · Free during beta
          </div>
        </div>
        <div className="hero-preview">
          <Card className="hero-preview-card">
            <div className="hero-preview-row"><Link2 size={16} /><span>go.linkorbit.app/wireless-earbuds</span></div>
            <div className="hero-preview-stats">
              <div><span>Clicks today</span><strong>1,248</strong></div>
              <div><span>Unique visitors</span><strong>842</strong></div>
              <div><span>Active keywords</span><strong>5</strong></div>
            </div>
          </Card>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-heading">
          <span className="eyebrow">Features</span>
          <h2>Everything you need to run performance-driven Amazon links</h2>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, description }) => (
            <Card className="feature-card" key={title}>
              <div className="feature-icon"><Icon size={20} /></div>
              <h3>{title}</h3>
              <p>{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="section section-alt" id="benefits">
        <div className="benefits-grid">
          <div className="section-heading left">
            <span className="eyebrow">Benefits</span>
            <h2>Own your data. Trust your numbers.</h2>
            <p>LinkOrbit runs on your own backend, so your click data, keyword rotations and visitor analytics stay entirely under your control.</p>
          </div>
          <ul className="benefits-list">
            {benefits.map((benefit) => (
              <li key={benefit}><CheckCircle2 size={19} /><span>{benefit}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section cta-section" id="pricing">
        <Card className="cta-card">
          <h2>Ready to start tracking smarter links?</h2>
          <p>Create your first rotating smart link in under two minutes.</p>
          <Button as={Link} to="/signup" size="lg" icon={ArrowRight}>Create your free account</Button>
        </Card>
      </section>

      <Footer />
    </div>
  )
}
