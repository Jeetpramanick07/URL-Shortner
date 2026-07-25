export function Field({ label, hint, error, children, htmlFor, optional = false }) {
  return (
    <label className="field" htmlFor={htmlFor}>
      {label && <span className="field-label">{label}{optional && <em> Optional</em>}</span>}
      {children}
      {hint && !error && <small className="field-hint">{hint}</small>}
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

export function Input({ icon: Icon, className = '', ...props }) {
  if (!Icon) return <input className={`input ${className}`} {...props} />
  return (
    <div className="input-icon-wrap">
      <Icon size={16} />
      <input className={`input ${className}`} {...props} />
    </div>
  )
}

export function Select({ className = '', children, ...props }) {
  return <select className={`input select ${className}`} {...props}>{children}</select>
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`input textarea ${className}`} {...props} />
}

export function Checkbox({ label, className = '', ...props }) {
  return (
    <label className={`checkbox-row ${className}`}>
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  )
}
