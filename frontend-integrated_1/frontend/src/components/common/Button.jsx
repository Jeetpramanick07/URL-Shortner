import { Loader2 } from 'lucide-react'

const VARIANT_CLASS = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost: 'btn btn-ghost',
  danger: 'btn btn-danger',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  full = false,
  className = '',
  children,
  ...props
}) {
  const classes = [
    VARIANT_CLASS[variant] || VARIANT_CLASS.primary,
    size === 'sm' ? 'btn-sm' : '',
    full ? 'btn-full' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <Component className={classes} {...props}>
      {loading ? <Loader2 size={16} className="spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </Component>
  )
}
