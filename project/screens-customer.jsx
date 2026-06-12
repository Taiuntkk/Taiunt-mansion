// Customer-facing portal for TaiUnt Mansion Park.
// Mobile-first design but works in the desktop frame too.

const { ROOMS: C_ROOMS, TENANTS: C_TENANTS, INVOICES: C_INVOICES, REPAIRS: C_REPAIRS, PROMOTIONS: C_PROMOTIONS, ANNOUNCEMENTS: C_ANNOUNCEMENTS, INV_STATUS: C_INV_STATUS, RPR_STATUS: C_RPR_STATUS } = window.TUMP_DATA;

// Demo tenant — "logged in as" คุณพิมพ์ชนก ใจดี, room 203, monthly
const DEMO_TENANT = C_TENANTS.find(t => t.room === '203') || C_TENANTS[0];
const DEMO_INVOICES = C_INVOICES.filter(i => i.tenantId === DEMO_TENANT.id);
const DEMO_REPAIRS = C_REPAIRS.filter(r => r.room === DEMO_TENANT.room);

function CustomerPortal() {
  const [tab, setTab] = React.useState('home');
  const [invSelected, setInvSelected] = React.useState(null);

  return (
    <div className="tu-portal">
      <PortalTopBar />
      <div style={{ padding: '20px 28px 100px', maxWidth: 720, margin: '0 auto' }}>
        <div className="tu-page-fade" key={tab}>
          {tab === 'home' && <PortalHome onOpenInvoice={(i) => setInvSelected(i)} setTab={setTab} />}
          {tab === 'billing' && <PortalBilling onOpenInvoice={(i) => setInvSelected(i)} />}
          {tab === 'repairs' && <PortalRepairs />}
          {tab === 'promos' && <PortalPromos />}
          {tab === 'profile' && <PortalProfile />}
        </div>
      </div>
      <PortalNav value={tab} onChange={setTab} />
      <PortalInvoice invoice={invSelected} onClose={() => setInvSelected(null)} />
    </div>
  );
}

function PortalTopBar() {
  return (
    <div style={{
      padding: '16px 28px', background: 'var(--primary)', color: '#fff',
      borderRadius: '0 0 20px 20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {I.logo}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>ไท้อันแมนชั่น ปาร์ค</div>
            <div style={{ fontSize: 11, opacity: .8 }}>Resident portal</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', position: 'relative' }}>
            {I.bell}
            <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#fde047', borderRadius: '50%' }} />
          </button>
          <Avatar name={DEMO_TENANT.name} size={32} />
        </div>
      </div>
    </div>
  );
}

function PortalNav({ value, onChange }) {
  const items = [
    { v: 'home', icon: I.dashboard, label: 'หน้าหลัก' },
    { v: 'billing', icon: I.billing, label: 'ใบแจ้งหนี้', badge: DEMO_INVOICES.filter(i => i.status !== 'paid').length },
    { v: 'repairs', icon: I.repairs, label: 'แจ้งซ่อม' },
    { v: 'promos', icon: I.promos, label: 'โปรโมชั่น' },
    { v: 'profile', icon: I.user, label: 'โปรไฟล์' },
  ];
  return (
    <div style={{
      position: 'sticky', bottom: 0, left: 0, right: 0,
      background: 'var(--surface)', borderTop: '1px solid var(--border)',
      padding: '8px 12px 12px', display: 'flex', gap: 4,
      maxWidth: 720, margin: '0 auto', justifyContent: 'space-around',
    }}>
      {items.map(it => {
        const active = value === it.v;
        return (
          <button key={it.v} onClick={() => onChange(it.v)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '8px 4px', background: 'transparent', border: 0, cursor: 'pointer',
            color: active ? 'var(--primary)' : 'var(--muted)', fontFamily: 'inherit',
            fontSize: 11, fontWeight: active ? 600 : 500, position: 'relative',
            transition: 'color .2s',
          }}>
            <span style={{ position: 'relative' }}>
              {it.icon}
              {it.badge > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  background: '#d44a4a', color: '#fff', fontSize: 10, fontWeight: 600,
                  width: 16, height: 16, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{it.badge}</span>
              )}
            </span>
            {it.label}
            {active && <span style={{ position: 'absolute', bottom: -8, height: 3, width: 28, background: 'var(--primary)', borderRadius: '3px 3px 0 0' }} />}
          </button>
        );
      })}
    </div>
  );
}

function PortalHome({ onOpenInvoice, setTab }) {
  const pending = DEMO_INVOICES.find(i => i.status !== 'paid');
  const room = C_ROOMS.find(r => r.id === DEMO_TENANT.room);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="tu-muted" style={{ fontSize: 13 }}>สวัสดีตอนเช้า,</div>
        <div style={{ fontSize: 22, fontWeight: 600, marginTop: 2 }}>{DEMO_TENANT.name.replace('คุณ','')}</div>
      </div>

      {/* Current room card */}
      <Card style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11.5, opacity: .85, fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase' }}>ห้องของคุณ</div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1, marginTop: 6, letterSpacing: '-.02em' }}>ห้อง {DEMO_TENANT.room}</div>
            <div style={{ fontSize: 12.5, opacity: .85, marginTop: 6 }}>{room.bed} • {room.size} ตร.ม. • ชั้น {room.floor}</div>
          </div>
          <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,.18)', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>รายเดือน</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.18)' }}>
          <div>
            <div style={{ fontSize: 10.5, opacity: .75 }}>ค่าเช่า</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>฿4,000<span style={{ opacity: .7, fontWeight: 400, fontSize: 11 }}> / ด.</span></div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, opacity: .75 }}>มัดจำ</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>฿5,000</div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, opacity: .75 }}>เข้าพักตั้งแต่</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{formatDate(DEMO_TENANT.checkIn)}</div>
          </div>
        </div>
      </Card>

      {/* Pending bill alert */}
      {pending && (
        <Card onClick={() => onOpenInvoice(pending)} style={{ cursor: 'pointer', border: '1px solid #d8a534', background: 'rgba(216,165,52,.06)' }} hoverable>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(216,165,52,.18)', color: '#9a6b00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{I.billing}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>มีใบแจ้งหนี้รอชำระ</div>
              <div className="tu-muted" style={{ fontSize: 12, marginTop: 2 }}>{pending.period} • ครบกำหนด {formatDate(pending.dueDate)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>฿{pending.total.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--primary)' }}>ชำระเลย →</div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        <QuickAction label="แจ้งซ่อม" icon={I.repairs} onClick={() => setTab('repairs')} />
        <QuickAction label="ดูใบเสร็จ" icon={I.billing} onClick={() => setTab('billing')} />
        <QuickAction label="โปรโมชั่น" icon={I.promos} onClick={() => setTab('promos')} />
        <QuickAction label="ติดต่อ" icon={I.phone} />
      </div>

      {/* Announcements */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>ข่าวสารจากหอ</div>
          <button className="tu-link" style={{ fontSize: 12 }}>ดูทั้งหมด →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {C_ANNOUNCEMENTS.map(a => (
            <Card key={a.id} padding={14}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{I.bell}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{a.title}</div>
                  <div className="tu-muted" style={{ fontSize: 12, marginTop: 4 }}>{a.body}</div>
                  <div className="tu-muted" style={{ fontSize: 11, marginTop: 6 }}>{formatDate(a.date)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ label, icon, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '14px 10px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
    }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
       onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
      <div style={{ color: 'var(--primary)' }}>{icon}</div>
      <div style={{ fontSize: 11.5, fontWeight: 500 }}>{label}</div>
    </button>
  );
}

function PortalBilling({ onOpenInvoice }) {
  // Synthesize history — current + 5 past months for the demo tenant
  const history = [
    ...DEMO_INVOICES,
    { id: 'INV-2026-04-X1', period: 'เมษายน 2569', dueDate: '2026-05-05', total: 4825, status: 'paid', paidAt: '2026-05-02', paymentMethod: 'QR PromptPay', items: [], type: 'monthly', tenantName: DEMO_TENANT.name, room: DEMO_TENANT.room, issueDate: '2026-04-25' },
    { id: 'INV-2026-03-X1', period: 'มีนาคม 2569', dueDate: '2026-04-05', total: 4655, status: 'paid', paidAt: '2026-04-01', paymentMethod: 'โอนธนาคาร', items: [], type: 'monthly', tenantName: DEMO_TENANT.name, room: DEMO_TENANT.room, issueDate: '2026-03-25' },
    { id: 'INV-2026-02-X1', period: 'กุมภาพันธ์ 2569', dueDate: '2026-03-05', total: 4900, status: 'paid', paidAt: '2026-03-04', paymentMethod: 'QR PromptPay', items: [], type: 'monthly', tenantName: DEMO_TENANT.name, room: DEMO_TENANT.room, issueDate: '2026-02-25' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader title="ใบแจ้งหนี้" subtitle="ดูใบแจ้งหนี้และประวัติการชำระ" />
      {history.map(inv => (
        <Card key={inv.id} onClick={() => onOpenInvoice(inv)} hoverable padding={16} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Badge tone={C_INV_STATUS[inv.status].tone} dot size="sm">{C_INV_STATUS[inv.status].th}</Badge>
                <span className="tu-muted" style={{ fontSize: 11, fontFamily: 'ui-monospace,monospace' }}>{inv.id}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{inv.period}</div>
              <div className="tu-muted" style={{ fontSize: 12, marginTop: 2 }}>
                {inv.status === 'paid' ? `ชำระแล้ว ${formatDate(inv.paidAt)}` : `ครบกำหนด ${formatDate(inv.dueDate)}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>฿{inv.total.toLocaleString()}</div>
              <div className="tu-link" style={{ fontSize: 11.5, marginTop: 2 }}>ดูรายละเอียด →</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function PortalInvoice({ invoice, onClose }) {
  const [paying, setPaying] = React.useState(false);
  React.useEffect(() => { if (!invoice) setPaying(false); }, [invoice]);
  if (!invoice) return null;
  return (
    <Modal open={!!invoice} onClose={onClose} width={520} title={invoice.status === 'paid' ? 'ใบเสร็จรับเงิน' : 'ใบแจ้งหนี้'}
      footer={
        invoice.status !== 'paid' && !paying ? (
          <Button fullWidth size="lg" onClick={() => setPaying(true)}>ชำระเงิน ฿{invoice.total.toLocaleString()}</Button>
        ) : invoice.status === 'paid' ? (
          <Button variant="secondary" fullWidth onClick={onClose}>ปิด</Button>
        ) : null
      }>
      {paying ? <PortalPay invoice={invoice} onDone={() => { invoice.status = 'paid'; invoice.paidAt = '2026-05-26'; invoice.paymentMethod = 'QR PromptPay'; setPaying(false); }} /> :
        <PortalInvoiceBody invoice={invoice} />}
    </Modal>
  );
}

function PortalInvoiceBody({ invoice }) {
  const items = invoice.items.length ? invoice.items : [
    { label: 'ค่าเช่าห้อง', qty: 1, unit: 'เดือน', price: 4000, amount: 4000 },
    { label: 'ค่าน้ำประปา', qty: 5, unit: 'หน่วย', price: 25, amount: 125 },
    { label: 'ค่าไฟฟ้า', qty: 90, unit: 'หน่วย', price: 8, amount: 720 },
  ];
  const sum = items.reduce((s, it) => s + it.amount, 0);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div className="tu-muted" style={{ fontSize: 11.5 }}>ออกให้</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{invoice.tenantName}</div>
          <div className="tu-muted" style={{ fontSize: 12 }}>ห้อง {invoice.room}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="tu-muted" style={{ fontSize: 11.5 }}>งวด</div>
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>{invoice.period}</div>
          <div className="tu-muted" style={{ fontSize: 11.5, marginTop: 2 }}>{invoice.id}</div>
        </div>
      </div>
      <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 16, marginBottom: 14 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
            <div>
              <span>{it.label}</span>
              <span className="tu-muted" style={{ marginLeft: 6, fontSize: 11.5 }}>{it.qty} {it.unit} × ฿{it.price.toLocaleString()}</span>
            </div>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>฿{it.amount.toLocaleString()}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
          <span style={{ fontWeight: 600 }}>รวมทั้งสิ้น</span>
          <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>฿{(invoice.total || sum).toLocaleString()}</span>
        </div>
      </div>
      {invoice.status === 'paid' && (
        <div style={{ padding: 14, background: 'rgba(22,101,52,.08)', color: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          {I.check}<span>ชำระแล้ว {formatDate(invoice.paidAt)} ผ่าน {invoice.paymentMethod}</span>
        </div>
      )}
    </div>
  );
}

function PortalPay({ invoice, onDone }) {
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setDone(true), 2400);
    return () => clearTimeout(t);
  }, [done]);
  React.useEffect(() => {
    if (done) {
      const t = setTimeout(onDone, 1500);
      return () => clearTimeout(t);
    }
  }, [done]);

  if (done) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)', color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          animation: 'tuCheckPop .5s cubic-bezier(.2,.8,.3,1.2) both' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
        </div>
        <div style={{ fontSize: 17, fontWeight: 600 }}>ชำระสำเร็จ</div>
        <div className="tu-muted" style={{ fontSize: 13, marginTop: 6 }}>ใบเสร็จถูกส่งไปยัง LINE ของคุณแล้ว</div>
        <div style={{ marginTop: 18, padding: 14, background: 'var(--surface-2)', borderRadius: 12, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div className="tu-muted" style={{ fontSize: 11 }}>จำนวนเงิน</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>฿{invoice.total.toLocaleString()}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 12px', textAlign: 'center' }}>
      <div className="tu-muted" style={{ fontSize: 13, marginBottom: 16 }}>สแกน QR เพื่อชำระผ่าน PromptPay</div>
      <div style={{ width: 220, height: 220, margin: '0 auto', borderRadius: 16, background: '#fff', padding: 18, border: '1px solid var(--border)', position: 'relative' }}>
        <FakeQR />
        <div style={{ position: 'absolute', top: 4, right: 4, background: 'var(--primary)', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600 }}>PromptPay</div>
      </div>
      <div style={{ marginTop: 18, fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>฿{invoice.total.toLocaleString()}</div>
      <div className="tu-muted" style={{ fontSize: 12, marginTop: 6 }}>กำลังรอการชำระเงิน...</div>
      <div style={{ marginTop: 16, height: 4, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--primary)', animation: 'tuProgress 2.4s linear' }} />
      </div>
    </div>
  );
}

// Tiny faux QR — random-looking but stable from a seed
function FakeQR() {
  const cells = [];
  const seed = 137;
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      // 3 finder corners
      const corner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      if (corner) {
        const cx = x < 7 ? 3 : 17, cy = y < 7 ? 3 : 17;
        const d = Math.max(Math.abs(x - cx), Math.abs(y - cy));
        if (d === 0 || d === 1 || d === 3) cells.push({ x, y });
      } else {
        if ((x * 7 + y * 13 + x * y * 3 + seed) % 5 < 2) cells.push({ x, y });
      }
    }
  }
  return (
    <svg viewBox="0 0 21 21" width="100%" height="100%">
      {cells.map((c, i) => <rect key={i} x={c.x} y={c.y} width={1} height={1} fill="#0c1f12" />)}
    </svg>
  );
}

function PortalRepairs() {
  const [composing, setComposing] = React.useState(false);
  const [sent, setSent] = React.useState(null);
  const [form, setForm] = React.useState({ category: 'แอร์', issue: '', priority: 'medium' });

  if (sent) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          animation: 'tuCheckPop .5s cubic-bezier(.2,.8,.3,1.2) both' }}>{I.check}</div>
        <div style={{ fontSize: 17, fontWeight: 600 }}>ส่งคำขอแจ้งซ่อมสำเร็จ</div>
        <div className="tu-muted" style={{ fontSize: 13, marginTop: 6 }}>เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชม.</div>
        <div style={{ marginTop: 18 }}><Button onClick={() => { setSent(null); setComposing(false); setForm({ category: 'แอร์', issue: '', priority: 'medium' }); }}>กลับสู่หน้าแจ้งซ่อม</Button></div>
      </div>
    );
  }

  if (composing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <PageHeader title="แจ้งซ่อมใหม่" subtitle={`ห้อง ${DEMO_TENANT.room}`} />
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--muted)', marginBottom: 8 }}>หมวดที่ต้องการแจ้ง</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {['แอร์','ไฟฟ้า','ประปา','อินเตอร์เน็ต','ประตู/หน้าต่าง','อื่นๆ'].map(c => (
                  <button key={c} onClick={() => setForm(p => ({ ...p, category: c }))} style={{
                    padding: '12px 8px', borderRadius: 10,
                    border: form.category === c ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: form.category === c ? 'var(--primary-soft)' : 'var(--surface)',
                    color: form.category === c ? 'var(--primary)' : 'var(--text)',
                    fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all .15s',
                  }}>{c}</button>
                ))}
              </div>
            </div>
            <Input label="อธิบายปัญหา" rows={4} value={form.issue} onChange={(v) => setForm(p => ({ ...p, issue: v }))} placeholder="เช่น แอร์ไม่เย็น มีน้ำหยดจากเครื่อง" />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--muted)', marginBottom: 8 }}>ความเร่งด่วน</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { v: 'low', t: 'ทั่วไป', c: 'neutral' },
                  { v: 'medium', t: 'ปานกลาง', c: 'amber' },
                  { v: 'high', t: 'เร่งด่วน', c: 'red' },
                ].map(o => (
                  <button key={o.v} onClick={() => setForm(p => ({ ...p, priority: o.v }))} style={{
                    flex: 1, padding: '10px 12px', borderRadius: 10,
                    border: form.priority === o.v ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: form.priority === o.v ? 'var(--primary-soft)' : 'var(--surface)',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  }}>{o.t}</button>
                ))}
              </div>
            </div>
          </div>
        </Card>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" fullWidth onClick={() => setComposing(false)}>ยกเลิก</Button>
          <Button fullWidth disabled={!form.issue.trim()} onClick={() => setSent(form)}>ส่งคำขอ</Button>
        </div>
      </div>
    );
  }

  const myRepairs = DEMO_REPAIRS.length ? DEMO_REPAIRS : [
    { id: 'RPR-2026-038', category: 'แอร์', issue: 'แอร์ไม่เย็น มีน้ำหยด', date: '2026-05-24 09:12', status: 'in-progress', priority: 'high' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader title="แจ้งซ่อม" subtitle="แจ้งปัญหาในห้องของคุณ"
        actions={<Button size="sm" icon={I.plus} onClick={() => setComposing(true)}>แจ้งใหม่</Button>} />
      {myRepairs.map(r => (
        <Card key={r.id} padding={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.category}</div>
              <div className="tu-muted" style={{ fontSize: 11.5, marginTop: 2 }}>{r.id} • {r.date}</div>
            </div>
            <Badge tone={C_RPR_STATUS[r.status].tone} dot>{C_RPR_STATUS[r.status].th}</Badge>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>{r.issue}</div>
          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <TimelineRow done label="ส่งคำขอ" date={r.date} />
            <TimelineRow done={r.status !== 'pending'} active={r.status === 'in-progress'} label="ช่างรับเรื่องและกำลังดำเนินการ" date={r.assignee && `โดย ${r.assignee}`} />
            <TimelineRow done={r.status === 'done'} label="ปิดงาน" date={r.completedAt} last />
          </div>
        </Card>
      ))}
    </div>
  );
}

function TimelineRow({ done, active, label, date, last }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: done ? 'var(--primary)' : 'var(--surface-2)',
          border: active ? '2px solid var(--primary)' : '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          flexShrink: 0,
        }}>
          {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>}
        </div>
        {!last && <div style={{ width: 1, flex: 1, background: done ? 'var(--primary)' : 'var(--border)', minHeight: 24 }} />}
      </div>
      <div style={{ paddingBottom: last ? 0 : 12, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: done || active ? 500 : 400, color: done || active ? 'var(--text)' : 'var(--muted)' }}>{label}</div>
        {date && <div className="tu-muted" style={{ fontSize: 11.5, marginTop: 2 }}>{date}</div>}
      </div>
    </div>
  );
}

function PortalPromos() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader title="โปรโมชั่น" subtitle="ข้อเสนอพิเศษและข่าวสาร" />
      {C_PROMOTIONS.filter(p => p.status === 'live').map(p => (
        <Card key={p.id} padding={0} hoverable style={{ overflow: 'hidden', cursor: 'pointer' }}>
          <div style={{
            height: 120,
            background: ({
              green: 'linear-gradient(135deg, #166534, #22a857)',
              lime: 'linear-gradient(135deg, #65A30D, #a3e635)',
              forest: 'linear-gradient(135deg, #14532d, #4d7c0f)',
              sage: 'linear-gradient(135deg, #84a98c, #cad2c5)',
            })[p.cover],
            position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 16,
          }}>
            <div style={{ position: 'absolute', top: 14, left: 14 }}>
              <Badge tone="green" size="sm" style={{ background: 'rgba(255,255,255,.9)', color: 'var(--primary)' }}>{p.tag}</Badge>
            </div>
            <div style={{ color: '#fff', fontSize: 17, fontWeight: 700, lineHeight: 1.35, textShadow: '0 1px 2px rgba(0,0,0,.2)' }}>{p.title}</div>
          </div>
          <div style={{ padding: 16 }}>
            <div className="tu-muted" style={{ fontSize: 13, lineHeight: 1.55 }}>{p.body}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span className="tu-muted" style={{ fontSize: 11.5 }}>เผยแพร่ {formatDate(p.published)}</span>
              <button className="tu-link" style={{ fontSize: 12.5 }}>ดูรายละเอียด →</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function PortalProfile() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card style={{ textAlign: 'center', padding: 28 }}>
        <Avatar name={DEMO_TENANT.name} size={88} />
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 12 }}>{DEMO_TENANT.name}</div>
        <div className="tu-muted" style={{ fontSize: 12.5, marginTop: 4 }}>{DEMO_TENANT.id} • ห้อง {DEMO_TENANT.room}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14 }}>
          <Badge tone="green">รายเดือน</Badge>
          <Badge tone="neutral">เข้าพักตั้งแต่ {formatDate(DEMO_TENANT.checkIn)}</Badge>
        </div>
      </Card>

      <Card>
        <SectionTitle>ข้อมูลผู้เข้าพัก</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <KV label="เลขบัตรประชาชน" value={DEMO_TENANT.idCard} />
          <KV label="เบอร์โทร" value={DEMO_TENANT.phone} />
          <KV label="LINE" value="@piyaporn-jaidee" />
          <KV label="เงินมัดจำประกัน" value={`฿${DEMO_TENANT.deposit.toLocaleString()}`} />
        </div>
      </Card>

      <Card>
        <SectionTitle>ติดต่อหอพัก</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ContactRow icon={I.phone} label="โทร" value="081-234-5678" bg="#fde2c8" fg="#b35a1f" />
          <ContactRow icon={I.line} label="LINE" value="@taiunt-mansion" bg="rgba(6,199,85,.12)" fg="#06c755" />
          <ContactRow icon={I.fb} label="Facebook" value="TaiUntMansionPark" bg="rgba(24,119,242,.12)" fg="#1877f2" />
        </div>
      </Card>

      <Button variant="secondary" fullWidth>ออกจากระบบ</Button>
    </div>
  );
}

function ContactRow({ icon, label, value, bg, fg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, background: 'var(--surface-2)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div>
        <div className="tu-muted" style={{ fontSize: 12 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

Object.assign(window, { CustomerPortal });
