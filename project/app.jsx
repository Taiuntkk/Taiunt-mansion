// App shell — auth → admin/customer router, sidebar, topbar, tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#166534", "#22a857", "#65A30D"],
  "thaiFont": "IBM Plex Sans Thai",
  "dark": false,
  "density": "comfortable"
}/*EDITMODE-END*/;

const PALETTES = [
  ['#166534', '#22a857', '#65A30D'], // forest + lime (default)
  ['#0F766E', '#14B8A6', '#5EEAD4'], // teal
  ['#2F5D3A', '#5e8a51', '#A8C97F'], // muted sage
  ['#0E7A41', '#10b981', '#34d399'], // emerald
];

const FONTS = ['IBM Plex Sans Thai', 'Sarabun', 'Prompt'];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [auth, setAuth] = React.useState(null); // null | 'admin' | 'customer'
  const [route, setRoute] = React.useState('dashboard');
  const [transitioning, setTransitioning] = React.useState(false);

  // Apply theme variables
  React.useEffect(() => {
    const [p1, p2, p3] = t.palette;
    const dark = t.dark;
    const root = document.documentElement;
    root.style.setProperty('--primary', p1);
    root.style.setProperty('--primary-dark', shade(p1, -0.15));
    root.style.setProperty('--primary-soft', dark ? `${p1}33` : `${p1}14`);
    root.style.setProperty('--accent', p3);
    root.style.setProperty('--accent-dark', shade(p3, -0.15));
    root.style.setProperty('--bg', dark ? '#0c1410' : '#fafaf7');
    root.style.setProperty('--surface', dark ? '#15201a' : '#ffffff');
    root.style.setProperty('--surface-2', dark ? '#1d2a23' : '#f3f5f0');
    root.style.setProperty('--surface-3', dark ? '#283930' : '#e9ece2');
    root.style.setProperty('--text', dark ? '#e8ecdf' : '#1c1f17');
    root.style.setProperty('--muted', dark ? '#9aaa97' : '#6b7264');
    root.style.setProperty('--border', dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)');
    root.style.fontFamily = `"${t.thaiFont}", ui-sans-serif, system-ui, -apple-system, sans-serif`;
    document.body.style.background = 'var(--bg)';
  }, [t.palette, t.dark, t.thaiFont]);

  // Density spacing
  React.useEffect(() => {
    const root = document.documentElement;
    if (t.density === 'compact') {
      root.style.setProperty('--gap', '14px');
      root.style.setProperty('--row-py', '8px');
      root.style.setProperty('--card-py', '14px');
    } else {
      root.style.setProperty('--gap', '20px');
      root.style.setProperty('--row-py', '14px');
      root.style.setProperty('--card-py', '20px');
    }
  }, [t.density]);

  const tweaksPanel = (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme" />
      <TweakColor label="Color tone" value={t.palette} options={PALETTES}
        onChange={(v) => setTweak('palette', v)} />
      <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />
      <TweakSection label="Typography" />
      <TweakSelect label="Thai font" value={t.thaiFont} options={FONTS}
        onChange={(v) => setTweak('thaiFont', v)} />
      <TweakSection label="Layout" />
      <TweakRadio label="Density" value={t.density}
        options={[{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfort' }]}
        onChange={(v) => setTweak('density', v)} />
      <TweakSection label="View" />
      <TweakRadio label="Portal" value={auth || 'auth'}
        options={[{ value: 'auth', label: 'Auth' }, { value: 'admin', label: 'Admin' }, { value: 'customer', label: 'Tenant' }]}
        onChange={(v) => { setAuth(v === 'auth' ? null : v); setRoute('dashboard'); }} />
    </TweaksPanel>
  );

  if (!auth) {
    return (
      <>
        <AuthScreen onLogin={(role) => setAuth(role)} />
        {tweaksPanel}
      </>
    );
  }

  if (auth === 'customer') {
    return (
      <>
        <CustomerPortal />
        <ViewSwitcher current="customer" onSwitch={(v) => { setAuth(v); setRoute('dashboard'); }} onLogout={() => setAuth(null)} />
        {tweaksPanel}
      </>
    );
  }

  const goto = (r) => {
    if (r === route) return;
    setTransitioning(true);
    setTimeout(() => { setRoute(r); setTransitioning(false); }, 120);
  };

  return (
    <>
      <div className="tu-shell">
        <Sidebar route={route} onNav={goto} />
        <div className="tu-main">
          <TopBar />
          <div className={'tu-content' + (transitioning ? ' tu-content-out' : '')}>
            <div className="tu-page-fade" key={route}>
              {route === 'dashboard' && <AdminDashboard goto={goto} />}
              {route === 'rooms' && <AdminRooms goto={goto} />}
              {route === 'tenants' && <AdminTenants />}
              {route === 'billing' && <AdminBilling />}
              {route === 'repairs' && <AdminRepairs />}
              {route === 'promos' && <AdminPromos />}
              {route === 'contact' && <AdminContact />}
            </div>
          </div>
        </div>
      </div>
      <ViewSwitcher current="admin" onSwitch={(v) => { setAuth(v); setRoute('dashboard'); }} onLogout={() => setAuth(null)} />
      {tweaksPanel}
    </>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────
function Sidebar({ route, onNav }) {
  const items = [
    { v: 'dashboard', icon: I.dashboard, label: 'Dashboard', th: 'ภาพรวม' },
    { v: 'rooms',     icon: I.rooms,     label: 'Rooms',     th: 'ผังห้อง' },
    { v: 'tenants',   icon: I.tenants,   label: 'Tenants',   th: 'ผู้เข้าพัก' },
    { v: 'billing',   icon: I.billing,   label: 'Billing',   th: 'ใบแจ้งหนี้' },
    { v: 'repairs',   icon: I.repairs,   label: 'Maintenance', th: 'แจ้งซ่อม' },
    { v: 'promos',    icon: I.promos,    label: 'Promotions', th: 'โปรโมชั่น' },
    { v: 'contact',   icon: I.contact,   label: 'Contact',    th: 'ติดต่อ' },
  ];
  return (
    <aside className="tu-sidebar">
      <div style={{ padding: '22px 22px 26px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{I.logo}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-.01em' }}>ไท้อันแมนชั่น ปาร์ค</div>
          <div className="tu-muted" style={{ fontSize: 11, lineHeight: 1.3 }}>TaiUnt Mansion Park</div>
        </div>
      </div>

      <nav style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', color: 'var(--muted)', padding: '8px 12px', textTransform: 'uppercase' }}>Workspace</div>
        {items.map(it => {
          const active = route === it.v;
          return (
            <button key={it.v} onClick={() => onNav(it.v)} className={'tu-nav-item' + (active ? ' tu-nav-active' : '')}>
              <span style={{ color: active ? 'var(--primary)' : 'var(--muted)', display: 'flex' }}>{it.icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 500 }}>{it.th}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>{it.label}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{ padding: '0 12px 16px' }}>
        <div style={{
          padding: 14, background: 'var(--primary-soft)', borderRadius: 12,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--primary)' }}>ส่งข่าวสารใหม่ผ่าน LINE</div>
          <div className="tu-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>ติดต่อผู้เข้าพักได้ทันที ผ่าน LINE Official Account</div>
          <Button size="sm" icon={I.line} style={{ marginTop: 4 }}>เปิดเครื่องมือ</Button>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <div className="tu-topbar">
      <div style={{ width: 360, maxWidth: '50%' }}>
        <Input prefix={I.search} placeholder="ค้นหาห้อง, ผู้เข้าพัก, ใบแจ้งหนี้..." value="" onChange={()=>{}} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button className="tu-icon-btn">
          {I.bell}
          <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#d44a4a', borderRadius: '50%', border: '2px solid var(--surface)' }} />
        </button>
        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name="ผู้ดูแล Admin" size={32} />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>ผู้ดูแลระบบ</div>
            <div className="tu-muted" style={{ fontSize: 11 }}>admin@taiunt</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewSwitcher({ current, onSwitch, onLogout }) {
  return (
    <div className="tu-viewswitch">
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', padding: '0 8px' }}>Demo view</div>
      <button onClick={() => current !== 'admin' && onSwitch('admin')}
        className={'tu-vs-btn' + (current === 'admin' ? ' tu-vs-active' : '')}>
        Admin
      </button>
      <button onClick={() => current !== 'customer' && onSwitch('customer')}
        className={'tu-vs-btn' + (current === 'customer' ? ' tu-vs-active' : '')}>
        Tenant
      </button>
      <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,.15)' }} />
      <button onClick={onLogout} className="tu-vs-btn" title="Sign out">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 17l5-5-5-5M20 12H9M12 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/></svg>
      </button>
    </div>
  );
}

// ── Auth (login + signup) ───────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = React.useState('signin');
  return (
    <div className="tu-auth">
      {/* Left: brand panel */}
      <div className="tu-auth-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>{I.logo}</div>
          <div style={{ color: '#fff', lineHeight: 1.3 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>ไท้อันแมนชั่น ปาร์ค</div>
            <div style={{ fontSize: 12, opacity: .8 }}>TaiUnt Mansion Park</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', color: '#fff' }}>
          <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.35, letterSpacing: '-.02em', maxWidth: 460 }}>
            ระบบบริหารหอพักที่ใช้งานง่าย<br />
            <span style={{ opacity: .7 }}>สำหรับผู้ดูแลและผู้เข้าพัก</span>
          </div>
          <div style={{ fontSize: 14, opacity: .8, marginTop: 16, maxWidth: 420, lineHeight: 1.6 }}>
            ดูสถานะห้อง รับชำระค่าเช่า แจ้งซ่อม และส่งข่าวผ่าน LINE — ทั้งหมดในที่เดียว
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 32, maxWidth: 460 }}>
            {[
              { n: '40', l: 'ห้องพัก' },
              { n: '2', l: 'ประเภท' },
              { n: '24/7', l: 'บริการ' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 28, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{s.n}</div>
                <div style={{ fontSize: 11.5, opacity: .65, marginTop: 2, letterSpacing: '.02em', textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative shapes */}
        <div style={{ position: 'absolute', right: -80, bottom: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
        <div style={{ position: 'absolute', right: 60, top: 80, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
      </div>

      {/* Right: form */}
      <div className="tu-auth-form">
        <div style={{ width: '100%', maxWidth: 380 }}>
          <Tabs value={mode} onChange={setMode} options={[
            { value: 'signin', label: 'Sign in' },
            { value: 'signup', label: 'Sign up' },
          ]} />
          <div style={{ marginTop: 28 }} key={mode} className="tu-page-fade">
            {mode === 'signin' ? <SignInForm onSubmit={onLogin} /> : <SignUpForm onSubmit={() => onLogin('customer')} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignInForm({ onSubmit }) {
  const [email, setEmail] = React.useState('admin@taiunt.co');
  const [pw, setPw] = React.useState('demo1234');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.01em' }}>เข้าสู่ระบบ</div>
        <div className="tu-muted" style={{ fontSize: 13, marginTop: 4 }}>ยินดีต้อนรับกลับ — เลือกประเภทบัญชีของคุณ</div>
      </div>
      <Input label="อีเมล" value={email} onChange={setEmail} placeholder="you@example.com" />
      <Input label="รหัสผ่าน" type="password" value={pw} onChange={setPw} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" defaultChecked /> จดจำการเข้าสู่ระบบ
        </label>
        <a href="#" className="tu-link">ลืมรหัสผ่าน?</a>
      </div>
      <Button fullWidth size="lg" onClick={() => onSubmit('admin')}>เข้าสู่ระบบเป็น Admin</Button>
      <Button fullWidth size="lg" variant="secondary" onClick={() => onSubmit('customer')}>เข้าสู่ระบบเป็นผู้เข้าพัก</Button>
      <div style={{ position: 'relative', textAlign: 'center', margin: '6px 0' }}>
        <div style={{ position: 'absolute', inset: '50% 0 auto', height: 1, background: 'var(--border)' }} />
        <span style={{ position: 'relative', background: 'var(--surface)', padding: '0 12px', fontSize: 11.5, color: 'var(--muted)' }}>หรือเข้าสู่ระบบด้วย</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Button variant="secondary" icon={<span style={{ color: '#06c755' }}>{I.line}</span>}>LINE</Button>
        <Button variant="secondary" icon={<span style={{ color: '#1877f2' }}>{I.fb}</span>}>Facebook</Button>
      </div>
    </div>
  );
}

function SignUpForm({ onSubmit }) {
  const [form, setForm] = React.useState({ name: '', phone: '', email: '', pw: '', agree: false });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.01em' }}>สมัครสมาชิกใหม่</div>
        <div className="tu-muted" style={{ fontSize: 13, marginTop: 4 }}>สมัครเพื่อใช้บริการจองห้องและจัดการบัญชีของคุณ</div>
      </div>
      <Input label="ชื่อ-นามสกุล" value={form.name} onChange={(v) => upd('name', v)} placeholder="คุณสมชาย ใจดี" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="เบอร์โทร" value={form.phone} onChange={(v) => upd('phone', v)} placeholder="081-234-5678" />
        <Input label="อีเมล" value={form.email} onChange={(v) => upd('email', v)} placeholder="you@example.com" />
      </div>
      <Input label="รหัสผ่าน" type="password" value={form.pw} onChange={(v) => upd('pw', v)} hint="อย่างน้อย 8 ตัวอักษร" />
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: 'var(--muted)', cursor: 'pointer' }}>
        <input type="checkbox" checked={form.agree} onChange={(e) => upd('agree', e.target.checked)} style={{ marginTop: 3 }} />
        <span>ฉันยอมรับ <a className="tu-link" href="#">ข้อตกลงการใช้งาน</a> และ <a className="tu-link" href="#">นโยบายความเป็นส่วนตัว</a></span>
      </label>
      <Button fullWidth size="lg" onClick={onSubmit} disabled={!form.agree}>สมัครสมาชิก</Button>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────
// Lighten/darken a hex color by a -1..1 amount (negative = darker)
function shade(hex, amt) {
  const h = hex.replace('#', '');
  const num = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16);
  let r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  const adj = (c) => Math.max(0, Math.min(255, Math.round(c + (amt < 0 ? c * amt : (255 - c) * amt))));
  r = adj(r); g = adj(g); b = adj(b);
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
