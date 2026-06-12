// Shared UI primitives for TaiUnt Mansion Park.
// All visual tokens come from CSS custom props on :root (set by app shell from tweaks).

function Card({ children, style, padding = 20, hoverable, onClick, ...rest }) {
  return (
    <div
      onClick={onClick}
      className={'tu-card' + (hoverable ? ' tu-card-hover' : '')}
      style={{ padding, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

function Stat({ label, value, sub, icon, tone = 'default' }) {
  return (
    <Card padding={18}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tu-muted" style={{ fontSize: 12, fontWeight: 500, letterSpacing: '.02em' }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
          {sub && <div className="tu-muted" style={{ fontSize: 12, marginTop: 6 }}>{sub}</div>}
        </div>
        {icon && (
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: tone === 'primary' ? 'var(--primary-soft)' : 'var(--surface-2)',
            color: tone === 'primary' ? 'var(--primary)' : 'var(--text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>{icon}</div>
        )}
      </div>
    </Card>
  );
}

function Badge({ tone = 'neutral', children, dot, size = 'md' }) {
  const palette = {
    green:   { bg: 'rgba(22,101,52,.10)',  fg: '#166534', dot: '#22a857' },
    amber:   { bg: 'rgba(180,120,0,.12)',  fg: '#9a6b00', dot: '#d8a534' },
    red:     { bg: 'rgba(180,40,40,.10)',  fg: '#b13e3e', dot: '#d44a4a' },
    orange:  { bg: 'rgba(200,90,30,.10)',  fg: '#b35a1f', dot: '#dd7531' },
    blue:    { bg: 'rgba(40,90,180,.10)',  fg: '#2b5db1', dot: '#3a76d4' },
    neutral: { bg: 'var(--surface-2)',     fg: 'var(--muted)', dot: 'var(--muted)' },
  }[tone] || { bg: 'var(--surface-2)', fg: 'var(--muted)', dot: 'var(--muted)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: size === 'sm' ? '2px 8px' : '4px 10px',
      borderRadius: 999, background: palette.bg, color: palette.fg,
      fontSize: size === 'sm' ? 11 : 12, fontWeight: 500, lineHeight: 1.2,
      whiteSpace: 'nowrap',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: palette.dot, flexShrink: 0 }} />}
      {children}
    </span>
  );
}

function Button({ children, variant = 'primary', size = 'md', icon, onClick, disabled, type = 'button', style, fullWidth }) {
  const sizes = {
    sm: { h: 30, padX: 12, fs: 12.5, gap: 6 },
    md: { h: 38, padX: 16, fs: 13.5, gap: 8 },
    lg: { h: 46, padX: 20, fs: 15, gap: 10 },
  }[size];
  const variants = {
    primary:   { bg: 'var(--primary)',     fg: '#fff',          border: 'transparent', hover: 'var(--primary-dark)' },
    secondary: { bg: 'var(--surface)',     fg: 'var(--text)',   border: 'var(--border)', hover: 'var(--surface-2)' },
    ghost:     { bg: 'transparent',        fg: 'var(--text)',   border: 'transparent', hover: 'var(--surface-2)' },
    danger:    { bg: '#fff',               fg: '#b13e3e',       border: 'rgba(180,40,40,.25)', hover: 'rgba(180,40,40,.06)' },
    accent:    { bg: 'var(--accent)',      fg: '#fff',          border: 'transparent', hover: 'var(--accent-dark)' },
  }[variant] || {};
  const [hover, setHover] = React.useState(false);
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: sizes.gap,
        height: sizes.h, padding: `0 ${sizes.padX}px`, fontSize: sizes.fs, fontWeight: 500,
        background: hover && !disabled ? variants.hover : variants.bg,
        color: variants.fg,
        border: `1px solid ${variants.border}`,
        borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background .15s, transform .12s',
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'inherit', whiteSpace: 'nowrap',
        ...style,
      }}>
      {icon}
      {children}
    </button>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text', suffix, prefix, rows, error, hint, style, ...rest }) {
  const isArea = rows && rows > 1;
  return (
    <label style={{ display: 'block', ...style }}>
      {label && <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>{label}</div>}
      <div style={{
        display: 'flex', alignItems: 'center',
        border: `1px solid ${error ? 'rgba(180,40,40,.5)' : 'var(--border)'}`,
        borderRadius: 10, background: 'var(--surface)',
        padding: isArea ? '8px 12px' : '0 12px',
        transition: 'border-color .15s, box-shadow .15s',
      }}>
        {prefix && <span style={{ color: 'var(--muted)', marginRight: 8, fontSize: 13 }}>{prefix}</span>}
        {isArea ? (
          <textarea value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} rows={rows}
            style={{ flex: 1, border: 0, outline: 0, fontFamily: 'inherit', fontSize: 14, background: 'transparent', color: 'inherit', resize: 'vertical', minHeight: 80, padding: 0 }}
            {...rest} />
        ) : (
          <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder}
            style={{ flex: 1, border: 0, outline: 0, fontFamily: 'inherit', fontSize: 14, background: 'transparent', color: 'inherit', height: 40, minWidth: 0 }}
            {...rest} />
        )}
        {suffix && <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: 13 }}>{suffix}</span>}
      </div>
      {hint && !error && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>{hint}</div>}
      {error && <div style={{ fontSize: 11.5, color: '#b13e3e', marginTop: 4 }}>{error}</div>}
    </label>
  );
}

function Tabs({ value, onChange, options }) {
  return (
    <div style={{
      display: 'inline-flex', padding: 4, borderRadius: 12,
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      gap: 2,
    }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)}
            style={{
              padding: '6px 14px', fontSize: 13, fontWeight: 500,
              border: 0, borderRadius: 8,
              background: active ? 'var(--surface)' : 'transparent',
              color: active ? 'var(--text)' : 'var(--muted)',
              boxShadow: active ? '0 1px 2px rgba(0,0,0,.06), 0 0 0 1px var(--border)' : 'none',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
            {o.icon}{o.label}
            {o.count != null && (
              <span style={{
                fontSize: 11, padding: '1px 6px', borderRadius: 999,
                background: active ? 'var(--primary-soft)' : 'rgba(0,0,0,.06)',
                color: active ? 'var(--primary)' : 'var(--muted)',
                fontVariantNumeric: 'tabular-nums',
              }}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Modal({ open, onClose, children, width = 560, title, footer }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(20, 30, 22, 0.45)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'tuFadeIn .2s ease-out',
      backdropFilter: 'blur(4px)',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: width, maxHeight: '92vh', overflow: 'auto',
        background: 'var(--surface)', borderRadius: 16,
        boxShadow: '0 24px 60px rgba(0,0,0,.18), 0 4px 12px rgba(0,0,0,.06)',
        animation: 'tuModalIn .25s cubic-bezier(.2,.8,.3,1.1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {title && (
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
            <button onClick={onClose} style={{
              width: 32, height: 32, border: 0, borderRadius: 8, background: 'transparent',
              color: 'var(--muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1,
            }}>✕</button>
          </div>
        )}
        <div style={{ padding: 24, flex: 1 }}>{children}</div>
        {footer && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'flex-end', gap: 8,
            background: 'var(--surface-2)', borderRadius: '0 0 16px 16px' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, body, action }) {
  return (
    <div style={{
      padding: '48px 24px', textAlign: 'center',
      color: 'var(--muted)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 12,
    }}>
      {icon && <div style={{ fontSize: 36, opacity: .4 }}>{icon}</div>}
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
      {body && <div style={{ fontSize: 13, maxWidth: 360 }}>{body}</div>}
      {action}
    </div>
  );
}

// Minimal SVG icon set (24x24 viewBox, stroke 1.6) — these are utility glyphs
// (chevrons, plus, filter, etc.), not branded imagery
const I = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  rooms: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V10l7-5 7 5v11"/><path d="M10 21v-6h4v6"/></svg>,
  tenants: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M14.5 20c0-2.7 2-4.2 5-4.2"/></svg>,
  billing: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h11l3 3v15a0 0 0 0 1 0 0H5z"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>,
  repairs: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m14.5 5.5 4 4-9.5 9.5L4 19l.5-5z"/><path d="m12 8 4 4"/></svg>,
  promos: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5 11.5 3l9.5 1-1 9.5L11.5 22z"/><circle cx="8" cy="8" r="1.3"/></svg>,
  contact: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16.5v3a1.5 1.5 0 0 1-1.7 1.5A18 18 0 0 1 3 4.7 1.5 1.5 0 0 1 4.5 3h3a1.5 1.5 0 0 1 1.5 1.3l.4 2.4a1.5 1.5 0 0 1-.4 1.4L7.5 9.5a14 14 0 0 0 7 7l1.4-1.5a1.5 1.5 0 0 1 1.4-.4l2.4.4A1.5 1.5 0 0 1 21 16.5z"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  filter: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 5h16l-6 8v6l-4-2v-4z"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v12m-5-5 5 5 5-5M4 20h16"/></svg>,
  print: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 9V3h10v6M7 18H4v-7h16v7h-3M7 14h10v8H7z"/></svg>,
  line: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c5.5 0 10 3.6 10 8 0 4.4-4.5 8-10 8-.8 0-1.6-.1-2.3-.2L5 21l1.5-3.5C4.4 16 3 13.6 3 11c0-4.4 4.5-8 9-8z"/></svg>,
  fb: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-8h3l.5-4H13V8c0-1.1.4-2 2-2h2V2.2c-.4 0-1.7-.2-3-.2-3 0-5 1.8-5 5v3H6v4h3v8z"/></svg>,
  phone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16.5v3a1.5 1.5 0 0 1-1.7 1.5A18 18 0 0 1 3 4.7 1.5 1.5 0 0 1 4.5 3h3a1.5 1.5 0 0 1 1.5 1.3l.4 2.4a1.5 1.5 0 0 1-.4 1.4L7.5 9.5a14 14 0 0 0 7 7l1.4-1.5a1.5 1.5 0 0 1 1.4-.4l2.4.4A1.5 1.5 0 0 1 21 16.5z"/></svg>,
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>,
  logo: <svg width="22" height="22" viewBox="0 0 32 32" fill="none"><path d="M5 27V13l11-8 11 8v14h-7V19h-8v8z" fill="currentColor"/><circle cx="16" cy="9" r="1.6" fill="#fff"/></svg>,
};

Object.assign(window, { Card, Stat, Badge, Button, Input, Tabs, Modal, EmptyState, I });
