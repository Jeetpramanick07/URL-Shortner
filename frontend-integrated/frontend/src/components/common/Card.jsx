export default function Card({ children, className = '', as: Component = 'section', ...props }) {
  return <Component className={`card ${className}`} {...props}>{children}</Component>
}

export function CardHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="card-heading-row">
      <div>
        {eyebrow && <span className="section-kicker">{eyebrow}</span>}
        {title && <h2>{title}</h2>}
        {description && <p className="card-heading-desc">{description}</p>}
      </div>
      {actions && <div className="card-heading-actions">{actions}</div>}
    </div>
  )
}
