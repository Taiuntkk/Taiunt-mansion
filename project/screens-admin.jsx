// Admin screens for TaiUnt Mansion Park.
// Reads window.TUMP_DATA + window UI primitives.

const { ROOMS, TENANTS, INVOICES, REPAIRS, PROMOTIONS, ANNOUNCEMENTS, REVENUE, STATUS_META, INV_STATUS, RPR_STATUS } = window.TUMP_DATA;

// ─── Dashboard ────────────────────────────────────────────────────────────
function AdminDashboard({ goto }) {
  const monthlyRooms = ROOMS.filter(r => r.type === 'monthly');
  const dailyRooms = ROOMS.filter(r => r.type === 'daily');
  const occupied = ROOMS.filter(r => r.status === 'occupied' || r.status === 'notice').length;
  const vacant = ROOMS.filter(r => r.status === 'vacant').length;
  const overdueCount = INVOICES.filter(i => i.status === 'overdue').length;
  const pendingInv = INVOICES.filter(i => i.status === 'pending').length;
  const openRepairs = REPAIRS.filter(r => r.status !== 'done').length;
  const totalRevenue = INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const occupancyPct = Math.round((occupied / ROOMS.length) * 100);

  const maxRev = Math.max(...REVENUE.map(r => r.monthly + r.daily));

  return (
    <div className="tu-page">
      <PageHeader title="ภาพรวมหอพัก" subtitle="Dashboard — สรุปสถานะหอพักประจำวันที่ 26 พ.ค. 2569"
        actions={<>
          <Button variant="secondary" size="sm" icon={I.download}>ส่งออกรายงาน</Button>
          <Button size="sm" icon={I.plus} onClick={() => goto('rooms')}>เปิดผังห้อง</Button>
        </>}
      />

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <Stat label="อัตราเข้าพัก" value={`${occupancyPct}%`} sub={`${occupied} / ${ROOMS.length} ห้อง`} tone="primary" icon={I.rooms} />
        <Stat label="รายรับเดือนนี้" value={`฿${(totalRevenue/1000).toFixed(1)}k`} sub={`จาก ${INVOICES.filter(i=>i.status==='paid').length} ใบเสร็จ`} icon={I.billing} />
        <Stat label="ใบแจ้งหนี้ค้างชำระ" value={pendingInv + overdueCount} sub={`เกินกำหนด ${overdueCount} ใบ`} icon={I.bell} />
        <Stat label="แจ้งซ่อมที่เปิดอยู่" value={openRepairs} sub={`รอ ${REPAIRS.filter(r=>r.status==='pending').length} • กำลังทำ ${REPAIRS.filter(r=>r.status==='in-progress').length}`} icon={I.repairs} />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 16 }}>
        {/* Revenue chart */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>รายรับ 6 เดือนล่าสุด</div>
              <div className="tu-muted" style={{ fontSize: 12, marginTop: 2 }}>เปรียบเทียบรายเดือน vs รายวัน</div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)' }} />
                <span className="tu-muted">รายเดือน</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)' }} />
                <span className="tu-muted">รายวัน</span>
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${REVENUE.length}, 1fr)`, gap: 18, alignItems: 'end', height: 200 }}>
            {REVENUE.map((r, i) => {
              const mh = (r.monthly / maxRev) * 180;
              const dh = (r.daily / maxRev) * 180;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'end', height: 180, width: '100%', justifyContent: 'center' }}>
                    <div className="tu-bar" style={{ width: '40%', height: mh, background: 'var(--primary)', borderRadius: '4px 4px 0 0', animation: `tuBarRise .8s ${i*60}ms cubic-bezier(.2,.8,.3,1.05) both` }} />
                    <div className="tu-bar" style={{ width: '40%', height: dh, background: 'var(--accent)', borderRadius: '4px 4px 0 0', animation: `tuBarRise .8s ${i*60 + 100}ms cubic-bezier(.2,.8,.3,1.05) both` }} />
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{r.m}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Occupancy donut */}
        <Card>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>สถานะห้อง</div>
          <div className="tu-muted" style={{ fontSize: 12, marginBottom: 16 }}>แบ่งตามสถานะปัจจุบัน</div>
          <OccupancyDonut />
        </Card>
      </div>

      {/* Recent activity row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>แจ้งซ่อมล่าสุด</div>
            <button className="tu-link" onClick={() => goto('repairs')}>ดูทั้งหมด →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {REPAIRS.slice(0, 4).map(r => (
              <div key={r.id} className="tu-list-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 2 }}>{r.category} • ห้อง {r.room}</div>
                  <div className="tu-muted" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.issue}</div>
                </div>
                <Badge tone={RPR_STATUS[r.status].tone} dot>{RPR_STATUS[r.status].th}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>ใบแจ้งหนี้ที่ค้างชำระ</div>
            <button className="tu-link" onClick={() => goto('billing')}>ดูทั้งหมด →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {INVOICES.filter(i => i.status !== 'paid').slice(0, 4).map(inv => (
              <div key={inv.id} className="tu-list-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 2 }}>{inv.tenantName} • ห้อง {inv.room}</div>
                  <div className="tu-muted" style={{ fontSize: 12 }}>{inv.id} • ครบกำหนด {formatDate(inv.dueDate)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>฿{inv.total.toLocaleString()}</div>
                  <Badge tone={INV_STATUS[inv.status].tone} dot>{INV_STATUS[inv.status].th}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function OccupancyDonut() {
  const buckets = ['occupied','vacant','booked','notice','maintenance'];
  const counts = buckets.map(s => ({ s, n: ROOMS.filter(r => r.status === s).length }));
  const total = ROOMS.length;
  const colorOf = (s) => ({
    occupied: 'var(--primary)',
    vacant: 'var(--surface-3)',
    booked: '#d8a534',
    notice: '#dd7531',
    maintenance: '#d44a4a',
  })[s];
  let acc = 0;
  const R = 60, C = 2 * Math.PI * R;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <div style={{ position: 'relative', width: 150, height: 150, flexShrink: 0 }}>
        <svg width={150} height={150} viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
          {counts.map((c, i) => {
            const len = (c.n / total) * C;
            const off = -acc;
            acc += len;
            return (
              <circle key={c.s} cx={75} cy={75} r={R} fill="none"
                stroke={colorOf(c.s)} strokeWidth={18}
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={off}
                style={{ transition: 'stroke-dasharray .6s' }} />
            );
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 600, lineHeight: 1 }}>{ROOMS.filter(r => r.status === 'occupied').length}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>เข้าพัก / {total}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {counts.map(c => (
          <div key={c.s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: colorOf(c.s), flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 12.5 }}>{STATUS_META[c.s].th}</span>
            <span style={{ fontSize: 12.5, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{c.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Room Map ────────────────────────────────────────────────────────────
function AdminRooms({ goto }) {
  const [filterType, setFilterType] = React.useState('all');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [selected, setSelected] = React.useState(null);

  const filtered = ROOMS.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });
  const floors = [1, 2, 3, 4];

  const typeOpts = [
    { value: 'all', label: 'ทั้งหมด', count: ROOMS.length },
    { value: 'monthly', label: 'รายเดือน', count: ROOMS.filter(r => r.type === 'monthly').length },
    { value: 'daily', label: 'รายวัน', count: ROOMS.filter(r => r.type === 'daily').length },
  ];

  const statusOpts = [
    { value: 'all', label: 'ทุกสถานะ' },
    ...Object.entries(STATUS_META).map(([k, v]) => ({ value: k, label: v.th })),
  ];

  return (
    <div className="tu-page">
      <PageHeader title="ผังห้อง" subtitle="Room Map — ดูสถานะและจัดการห้องทั้งหมด"
        actions={<>
          <Button variant="secondary" size="sm" icon={I.download}>ส่งออกผัง</Button>
          <Button size="sm" icon={I.plus}>เพิ่มห้องใหม่</Button>
        </>}
      />

      {/* Filters */}
      <Card padding={16}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
          <Tabs value={filterType} onChange={setFilterType} options={typeOpts} />
          <div style={{ height: 24, width: 1, background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="tu-muted" style={{ fontSize: 12.5 }}>สถานะ</span>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="tu-select">
              {statusOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }} />
          <RoomLegend />
        </div>
      </Card>

      {/* Floors */}
      {floors.map(f => {
        const onFloor = filtered.filter(r => r.floor === f);
        if (onFloor.length === 0) return null;
        const isDailyFloor = f === 4;
        return (
          <Card key={f} padding={20}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'var(--primary-soft)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 600,
              }}>F{f}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>ชั้น {f}</div>
                <div className="tu-muted" style={{ fontSize: 12 }}>
                  {isDailyFloor ? 'ห้องรายวัน' : 'ห้องรายเดือน'} • {onFloor.length} ห้อง •
                  เข้าพัก {onFloor.filter(r => r.status === 'occupied').length} ห้อง
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 10 }}>
              {onFloor.map(r => <RoomTile key={r.id} room={r} onClick={() => setSelected(r)} />)}
            </div>
          </Card>
        );
      })}

      <RoomDetailModal room={selected} onClose={() => setSelected(null)} goto={goto} />
    </div>
  );
}

function RoomLegend() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {Object.entries(STATUS_META).map(([k, v]) => (
        <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--muted)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: roomFill(k) }} />
          {v.th}
        </span>
      ))}
    </div>
  );
}

function roomFill(status) {
  return ({
    vacant: 'var(--surface-3)',
    booked: '#fef3c7',
    occupied: 'var(--primary)',
    notice: '#fde2c8',
    maintenance: '#fcd2d2',
    cleaning: '#dbeafe',
  })[status];
}

function roomTextColor(status) {
  return status === 'occupied' ? '#fff' : 'var(--text)';
}

function RoomTile({ room, onClick }) {
  return (
    <button onClick={onClick} className="tu-room-tile"
      style={{
        background: roomFill(room.status),
        color: roomTextColor(room.status),
        border: room.status === 'occupied' ? '1px solid var(--primary-dark)' : '1px solid var(--border)',
      }}>
      <div style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{room.id}</div>
      <div style={{ fontSize: 10, opacity: .75, marginTop: 2 }}>{STATUS_META[room.status].th}</div>
    </button>
  );
}

function RoomDetailModal({ room, onClose, goto }) {
  if (!room) return null;
  const tenant = TENANTS.find(t => t.room === room.id);
  const invoice = INVOICES.find(i => i.room === room.id && i.status !== 'paid');
  return (
    <Modal open={!!room} onClose={onClose} title={`ห้อง ${room.id}`} width={580}
      footer={<>
        <Button variant="secondary" onClick={onClose}>ปิด</Button>
        {room.status === 'vacant' && <Button onClick={() => { onClose(); goto('tenants'); }}>จองห้องนี้</Button>}
        {room.status === 'occupied' && <Button onClick={() => { onClose(); goto('billing'); }}>ดูใบแจ้งหนี้</Button>}
      </>}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{
          width: 88, height: 88, borderRadius: 14,
          background: roomFill(room.status), color: roomTextColor(room.status),
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600,
        }}>
          <div style={{ fontSize: 24 }}>{room.id}</div>
          <div style={{ fontSize: 11, marginTop: 2, opacity: .8 }}>ชั้น {room.floor}</div>
        </div>
        <div style={{ flex: 1 }}>
          <Badge tone={STATUS_META[room.status].tone} dot>{STATUS_META[room.status].th}</Badge>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <KV label="ประเภท" value={room.type === 'monthly' ? 'รายเดือน' : 'รายวัน'} />
            <KV label="ขนาด" value={`${room.size} ตร.ม.`} />
            <KV label="เตียง" value={room.bed} />
            <KV label="ค่าเช่า" value={`฿${room.rent.toLocaleString()} / ${room.type === 'monthly' ? 'เดือน' : 'คืน'}`} />
          </div>
        </div>
      </div>

      {tenant && (
        <div>
          <SectionTitle>ผู้เข้าพัก</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 12 }}>
            <Avatar name={tenant.name} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{tenant.name}</div>
              <div className="tu-muted" style={{ fontSize: 12 }}>{tenant.phone} • เข้าพักตั้งแต่ {formatDate(tenant.checkIn)}</div>
            </div>
            <Badge tone="green">รหัส {tenant.id}</Badge>
          </div>
        </div>
      )}

      {invoice && (
        <div style={{ marginTop: 16 }}>
          <SectionTitle>ใบแจ้งหนี้ค้างชำระ</SectionTitle>
          <div className="tu-list-row" style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{invoice.id}</div>
              <div className="tu-muted" style={{ fontSize: 12 }}>{invoice.period} • ครบกำหนด {formatDate(invoice.dueDate)}</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>฿{invoice.total.toLocaleString()}</div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <SectionTitle>การกระทำ</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <ActionTile label="ย้ายห้อง" disabled={room.status !== 'occupied'} />
          <ActionTile label="แจ้งออก" disabled={room.status !== 'occupied'} />
          <ActionTile label="ปิดซ่อม" disabled={room.status === 'occupied'} />
        </div>
      </div>
    </Modal>
  );
}

function ActionTile({ label, disabled }) {
  return (
    <button disabled={disabled} style={{
      padding: '12px 10px', borderRadius: 10, border: '1px solid var(--border)',
      background: 'var(--surface)', color: 'var(--text)',
      fontSize: 13, fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .4 : 1, transition: 'background .15s',
    }} onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = 'var(--surface-2)'; }}
       onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}>
      {label}
    </button>
  );
}

// ─── Tenants ────────────────────────────────────────────────────────────
function AdminTenants() {
  const [tab, setTab] = React.useState('list');
  return (
    <div className="tu-page">
      <PageHeader title="ผู้เข้าพัก" subtitle="Tenants — ทะเบียนผู้เข้าพักและการลงทะเบียนใหม่" />
      <Tabs value={tab} onChange={setTab} options={[
        { value: 'list', label: 'ทะเบียนผู้เข้าพัก', count: TENANTS.length },
        { value: 'register', label: 'ลงทะเบียนใหม่' },
      ]} />
      {tab === 'list' ? <TenantList /> : <TenantRegister onDone={() => setTab('list')} />}
    </div>
  );
}

function TenantList() {
  const [query, setQuery] = React.useState('');
  const [type, setType] = React.useState('all');
  const filtered = TENANTS.filter(t => {
    if (type !== 'all' && t.type !== type) return false;
    if (query && !(t.name.includes(query) || t.room.includes(query) || t.id.includes(query))) return false;
    return true;
  });
  return (
    <Card padding={0}>
      <div style={{ display: 'flex', gap: 12, padding: 16, borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
        <div style={{ flex: 1, maxWidth: 360 }}>
          <Input prefix={I.search} placeholder="ค้นหาชื่อ, รหัส, ห้อง..." value={query} onChange={setQuery} />
        </div>
        <Tabs value={type} onChange={setType} options={[
          { value: 'all', label: 'ทั้งหมด' },
          { value: 'monthly', label: 'รายเดือน' },
          { value: 'daily', label: 'รายวัน' },
        ]} />
      </div>
      <table className="tu-table">
        <thead>
          <tr>
            <th>รหัส</th><th>ชื่อผู้เข้าพัก</th><th>ห้อง</th><th>ประเภท</th>
            <th>เบอร์โทร</th><th>เข้าพักตั้งแต่</th><th>สถานะ</th><th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(t => (
            <tr key={t.id}>
              <td style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{t.id}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={t.name} size={28} />
                  <span style={{ fontWeight: 500 }}>{t.name}</span>
                </div>
              </td>
              <td><Badge tone="neutral">{t.room}</Badge></td>
              <td>{t.type === 'monthly' ? 'รายเดือน' : 'รายวัน'}</td>
              <td style={{ fontVariantNumeric: 'tabular-nums' }}>{t.phone}</td>
              <td>{formatDate(t.checkIn)}</td>
              <td><Badge tone={STATUS_META[t.status].tone} dot>{STATUS_META[t.status].th}</Badge></td>
              <td><button className="tu-link">ดูข้อมูล →</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function TenantRegister({ onDone }) {
  const [form, setForm] = React.useState({
    type: 'monthly', name: '', idCard: '', phone: '', email: '',
    room: '', checkIn: '2026-06-01', deposit: 5000, notes: '',
  });
  const [step, setStep] = React.useState(1);
  const [submitted, setSubmitted] = React.useState(false);
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v, ...(k === 'type' ? { deposit: v === 'monthly' ? 5000 : 200, room: '' } : {}) }));
  const availableRooms = ROOMS.filter(r => r.type === form.type && r.status === 'vacant');

  if (submitted) {
    return (
      <Card padding={48} style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-soft)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: 16 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>ลงทะเบียนสำเร็จ</div>
        <div className="tu-muted" style={{ fontSize: 13, marginTop: 6 }}>
          คุณ{form.name || 'ผู้เข้าพัก'} • ห้อง {form.room || '—'} • {form.type === 'monthly' ? 'รายเดือน' : 'รายวัน'}
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => { setSubmitted(false); setStep(1); setForm({ type: 'monthly', name: '', idCard: '', phone: '', email: '', room: '', checkIn: '2026-06-01', deposit: 5000, notes: '' }); }}>ลงทะเบียนคนใหม่</Button>
          <Button onClick={onDone}>ไปทะเบียนผู้เข้าพัก</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card padding={28}>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
        {/* Steps */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>ขั้นตอน</div>
          {['ประเภทและห้อง', 'ข้อมูลส่วนตัว', 'ยืนยันและบันทึก'].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: step > i + 1 ? 'var(--primary)' : step === i + 1 ? 'var(--primary)' : 'var(--surface-2)',
                color: step >= i + 1 ? '#fff' : 'var(--muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600, flexShrink: 0,
                transition: 'all .25s',
              }}>{step > i + 1 ? '✓' : i + 1}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: step === i + 1 ? 'var(--text)' : 'var(--muted)' }}>{s}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Form */}
        <div>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--muted)' }}>ประเภทการเช่า</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { v: 'monthly', t: 'รายเดือน', s: '฿4,000 / เดือน • มัดจำ ฿5,000', icon: '📅' },
                    { v: 'daily', t: 'รายวัน', s: '฿500 / คืน • มัดจำกุญแจ ฿200', icon: '🌙' },
                  ].map(o => (
                    <button key={o.v} onClick={() => upd('type', o.v)}
                      style={{
                        textAlign: 'left', padding: 16, borderRadius: 12,
                        border: form.type === o.v ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: form.type === o.v ? 'var(--primary-soft)' : 'var(--surface)',
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all .15s',
                      }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{o.t}</div>
                      <div className="tu-muted" style={{ fontSize: 12 }}>{o.s}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--muted)' }}>เลือกห้องว่าง ({availableRooms.length} ห้อง)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                  {availableRooms.map(r => (
                    <button key={r.id} onClick={() => upd('room', r.id)}
                      style={{
                        padding: '12px 4px', borderRadius: 8,
                        border: form.room === r.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: form.room === r.id ? 'var(--primary)' : 'var(--surface)',
                        color: form.room === r.id ? '#fff' : 'var(--text)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        fontVariantNumeric: 'tabular-nums', fontFamily: 'inherit',
                        transition: 'all .15s',
                      }}>{r.id}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <Button onClick={() => setStep(2)} disabled={!form.room}>ถัดไป →</Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Input label="ชื่อ-นามสกุล" value={form.name} onChange={(v) => upd('name', v)} placeholder="คุณสมชาย ใจดี" />
                <Input label="เลขบัตรประชาชน" value={form.idCard} onChange={(v) => upd('idCard', v)} placeholder="1-2345-67890-12-3" />
                <Input label="เบอร์โทร" value={form.phone} onChange={(v) => upd('phone', v)} placeholder="081-234-5678" />
                <Input label="อีเมล" value={form.email} onChange={(v) => upd('email', v)} placeholder="email@example.com" />
                <Input label="วันที่เข้าพัก" type="date" value={form.checkIn} onChange={(v) => upd('checkIn', v)} />
                <Input label={`เงินมัดจำ${form.type === 'monthly' ? 'ประกัน' : 'กุญแจ'}`} prefix="฿" value={form.deposit} onChange={(v) => upd('deposit', v)} />
              </div>
              <Input label="หมายเหตุ" value={form.notes} onChange={(v) => upd('notes', v)} placeholder="ข้อมูลเพิ่มเติม" rows={3} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                <Button variant="secondary" onClick={() => setStep(1)}>← ย้อนกลับ</Button>
                <Button onClick={() => setStep(3)} disabled={!form.name || !form.phone}>ถัดไป →</Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <div style={{ padding: 20, background: 'var(--surface-2)', borderRadius: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>สรุปข้อมูลการลงทะเบียน</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                  <KV label="ประเภท" value={form.type === 'monthly' ? 'รายเดือน' : 'รายวัน'} />
                  <KV label="ห้อง" value={form.room} />
                  <KV label="ชื่อ" value={form.name || '—'} />
                  <KV label="โทร" value={form.phone || '—'} />
                  <KV label="เข้าพัก" value={formatDate(form.checkIn)} />
                  <KV label={`เงินมัดจำ${form.type === 'monthly' ? 'ประกัน' : 'กุญแจ'}`} value={`฿${Number(form.deposit).toLocaleString()}`} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="secondary" onClick={() => setStep(2)}>← ย้อนกลับ</Button>
                <Button onClick={() => setSubmitted(true)} icon={I.check}>ยืนยันการลงทะเบียน</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Billing ────────────────────────────────────────────────────────────
function AdminBilling() {
  const [filter, setFilter] = React.useState('all');
  const [selected, setSelected] = React.useState(null);
  const [showReceipt, setShowReceipt] = React.useState(null);

  const filtered = filter === 'all' ? INVOICES : INVOICES.filter(i => i.status === filter);
  const stats = {
    paid: INVOICES.filter(i => i.status === 'paid').length,
    pending: INVOICES.filter(i => i.status === 'pending').length,
    overdue: INVOICES.filter(i => i.status === 'overdue').length,
  };
  const totalPaid = INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalDue = INVOICES.filter(i => i.status !== 'paid').reduce((s, i) => s + i.total, 0);

  return (
    <div className="tu-page">
      <PageHeader title="ใบแจ้งหนี้และการรับชำระ" subtitle="Billing — ใบแจ้งหนี้ การรับชำระ และใบเสร็จรับเงิน"
        actions={<>
          <Button variant="secondary" size="sm" icon={I.download}>ส่งออก Excel</Button>
          <Button size="sm" icon={I.plus}>สร้างใบแจ้งหนี้</Button>
        </>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <Stat label="ชำระแล้วเดือนนี้" value={`฿${totalPaid.toLocaleString()}`} sub={`${stats.paid} ใบเสร็จ`} tone="primary" icon={I.check} />
        <Stat label="ค้างชำระ" value={`฿${totalDue.toLocaleString()}`} sub={`${stats.pending + stats.overdue} ใบ`} icon={I.bell} />
        <Stat label="ครบกำหนดสัปดาห์นี้" value={INVOICES.filter(i => i.status === 'pending').length} sub="ภายใน 5 มิ.ย." icon={I.billing} />
        <Stat label="เกินกำหนด" value={stats.overdue} sub="ต้องติดตาม" icon={I.bell} />
      </div>

      <Card padding={0} style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', padding: 16, borderBottom: '1px solid var(--border)', alignItems: 'center', gap: 12 }}>
          <Tabs value={filter} onChange={setFilter} options={[
            { value: 'all', label: 'ทั้งหมด', count: INVOICES.length },
            { value: 'pending', label: 'รอชำระ', count: stats.pending },
            { value: 'overdue', label: 'เกินกำหนด', count: stats.overdue },
            { value: 'paid', label: 'ชำระแล้ว', count: stats.paid },
          ]} />
          <div style={{ flex: 1 }} />
          <div style={{ width: 280 }}>
            <Input prefix={I.search} placeholder="ค้นหาเลขที่ใบแจ้งหนี้, ห้อง..." value="" onChange={()=>{}} />
          </div>
        </div>
        <table className="tu-table">
          <thead>
            <tr><th>เลขที่</th><th>ผู้เช่า</th><th>ห้อง</th><th>งวด</th><th>ออกใบ</th><th>ครบกำหนด</th>
              <th style={{ textAlign: 'right' }}>ยอด (฿)</th><th>สถานะ</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} className="tu-row-hover" onClick={() => setSelected(inv)}>
                <td style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11.5 }}>{inv.id}</td>
                <td style={{ fontWeight: 500 }}>{inv.tenantName}</td>
                <td><Badge tone="neutral">{inv.room}</Badge></td>
                <td className="tu-muted">{inv.period}</td>
                <td className="tu-muted">{formatDate(inv.issueDate)}</td>
                <td className="tu-muted">{formatDate(inv.dueDate)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>฿{inv.total.toLocaleString()}</td>
                <td><Badge tone={INV_STATUS[inv.status].tone} dot>{INV_STATUS[inv.status].th}</Badge></td>
                <td>
                  {inv.status === 'paid' ? (
                    <button className="tu-link" onClick={(e) => { e.stopPropagation(); setShowReceipt(inv); }}>ใบเสร็จ</button>
                  ) : (
                    <button className="tu-link">รับชำระ →</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <InvoiceModal invoice={selected} onClose={() => setSelected(null)} onPaid={(inv) => { setSelected(null); setShowReceipt(inv); }} />
      <ReceiptModal invoice={showReceipt} onClose={() => setShowReceipt(null)} />
    </div>
  );
}

function InvoiceModal({ invoice, onClose, onPaid }) {
  const [paying, setPaying] = React.useState(false);
  const [method, setMethod] = React.useState('qr');
  if (!invoice) return null;
  const isPaid = invoice.status === 'paid';

  return (
    <Modal open={!!invoice} onClose={onClose} title={`ใบแจ้งหนี้ ${invoice.id}`} width={640}
      footer={isPaid ? (
        <>
          <Button variant="secondary" onClick={onClose}>ปิด</Button>
          <Button variant="secondary" icon={I.print}>พิมพ์</Button>
          <Button onClick={() => onPaid(invoice)}>ดูใบเสร็จ</Button>
        </>
      ) : (
        <>
          <Button variant="secondary" onClick={onClose}>ปิด</Button>
          <Button variant="secondary" icon={I.print}>พิมพ์ใบแจ้งหนี้</Button>
          <Button onClick={() => setPaying(true)}>รับชำระเงิน →</Button>
        </>
      )}
    >
      {paying ? (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>เลือกช่องทางการรับชำระ</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
            {[
              { v: 'qr', t: 'QR PromptPay', s: 'สแกนจ่ายทันที' },
              { v: 'bank', t: 'โอนธนาคาร', s: 'หลักฐานการโอน' },
              { v: 'cash', t: 'เงินสด', s: 'รับที่ออฟฟิศ' },
            ].map(o => (
              <button key={o.v} onClick={() => setMethod(o.v)} style={{
                padding: 16, borderRadius: 12, fontFamily: 'inherit', textAlign: 'left',
                border: method === o.v ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: method === o.v ? 'var(--primary-soft)' : 'var(--surface)',
                cursor: 'pointer', transition: 'all .15s',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{o.t}</div>
                <div className="tu-muted" style={{ fontSize: 11.5, marginTop: 2 }}>{o.s}</div>
              </button>
            ))}
          </div>
          <div style={{ padding: 16, background: 'var(--surface-2)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="tu-muted" style={{ fontSize: 12 }}>ยอดที่รับชำระ</div>
              <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>฿{invoice.total.toLocaleString()}</div>
            </div>
            <Button onClick={() => { invoice.status = 'paid'; invoice.paidAt = '2026-05-26'; invoice.paymentMethod = { qr: 'QR PromptPay', bank: 'โอนธนาคาร', cash: 'เงินสด' }[method]; onPaid(invoice); }} icon={I.check}>ยืนยันรับชำระ</Button>
          </div>
        </div>
      ) : (
        <InvoiceBody invoice={invoice} />
      )}
    </Modal>
  );
}

function InvoiceBody({ invoice }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div className="tu-muted" style={{ fontSize: 12 }}>ออกให้</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{invoice.tenantName}</div>
          <div className="tu-muted" style={{ fontSize: 12.5, marginTop: 2 }}>ห้อง {invoice.room} • {invoice.type === 'monthly' ? 'รายเดือน' : 'รายวัน'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="tu-muted" style={{ fontSize: 12 }}>งวด</div>
          <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 2 }}>{invoice.period}</div>
          <div className="tu-muted" style={{ fontSize: 12, marginTop: 2 }}>ครบกำหนด {formatDate(invoice.dueDate)}</div>
        </div>
      </div>
      <table className="tu-table tu-table-inline" style={{ marginBottom: 14 }}>
        <thead><tr><th>รายการ</th><th style={{ textAlign: 'right' }}>จำนวน</th><th style={{ textAlign: 'right' }}>หน่วยละ</th><th style={{ textAlign: 'right' }}>รวม (฿)</th></tr></thead>
        <tbody>
          {invoice.items.map((it, i) => (
            <tr key={i}>
              <td>{it.label}</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{it.qty} {it.unit}</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>฿{it.price.toLocaleString()}</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>฿{it.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 0', borderTop: '2px solid var(--text)', marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span className="tu-muted" style={{ fontSize: 13 }}>รวมทั้งสิ้น</span>
          <span style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>฿{invoice.total.toLocaleString()}</span>
        </div>
      </div>
      {invoice.status === 'paid' && (
        <div style={{ padding: 12, background: 'rgba(22,101,52,.08)', borderRadius: 10, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          {I.check} ชำระเรียบร้อย {formatDate(invoice.paidAt)} ผ่าน {invoice.paymentMethod}
        </div>
      )}
    </div>
  );
}

function ReceiptModal({ invoice, onClose }) {
  if (!invoice) return null;
  return (
    <Modal open={!!invoice} onClose={onClose} title="ใบเสร็จรับเงิน" width={520}
      footer={<>
        <Button variant="secondary" onClick={onClose}>ปิด</Button>
        <Button variant="secondary" icon={I.download}>ดาวน์โหลด PDF</Button>
        <Button icon={I.print}>พิมพ์</Button>
      </>}>
      <div style={{ border: '2px dashed var(--border)', borderRadius: 14, padding: 28, background: 'var(--surface-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)' }}>{I.logo}<span style={{ fontWeight: 700, fontSize: 14 }}>ไท้อันแมนชั่น ปาร์ค</span></div>
            <div className="tu-muted" style={{ fontSize: 11, marginTop: 4 }}>123 ถ.ตัวอย่าง อ.เมือง จ.เชียงใหม่<br/>เลขประจำตัวผู้เสียภาษี 0-1234-56789-01-2</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '.04em' }}>ใบเสร็จ</div>
            <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11.5, marginTop: 2 }}>RCP-{invoice.id.replace('INV-','')}</div>
            <div className="tu-muted" style={{ fontSize: 11, marginTop: 2 }}>{formatDate(invoice.paidAt)}</div>
          </div>
        </div>
        <div style={{ paddingBottom: 14, borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
          <div className="tu-muted" style={{ fontSize: 11.5 }}>ได้รับจาก</div>
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{invoice.tenantName}</div>
          <div className="tu-muted" style={{ fontSize: 12 }}>ห้อง {invoice.room} • อ้างอิง {invoice.id}</div>
        </div>
        {invoice.items.map((it, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 }}>
            <span>{it.label} <span className="tu-muted">×{it.qty}</span></span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>฿{it.amount.toLocaleString()}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--text)', paddingTop: 12, marginTop: 8 }}>
          <span style={{ fontWeight: 600 }}>รวมทั้งสิ้น</span>
          <span style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>฿{invoice.total.toLocaleString()}</span>
        </div>
        <div style={{ marginTop: 16, fontSize: 11.5, color: 'var(--muted)', textAlign: 'center' }}>
          ชำระโดย {invoice.paymentMethod} • ขอบคุณที่ใช้บริการ
        </div>
      </div>
    </Modal>
  );
}

// ─── Repairs ────────────────────────────────────────────────────────────
function AdminRepairs() {
  const [tab, setTab] = React.useState('all');
  const [selected, setSelected] = React.useState(null);
  const filtered = tab === 'all' ? REPAIRS : REPAIRS.filter(r => r.status === tab);
  return (
    <div className="tu-page">
      <PageHeader title="แจ้งซ่อม" subtitle="Maintenance — ติดตามและจัดการคำขอแจ้งซ่อมจากผู้เข้าพัก"
        actions={<Button size="sm" icon={I.plus}>เพิ่มงานซ่อม</Button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <Stat label="งานทั้งหมด" value={REPAIRS.length} icon={I.repairs} />
        <Stat label="รอรับเรื่อง" value={REPAIRS.filter(r=>r.status==='pending').length} sub="ต้องมอบหมายช่าง" />
        <Stat label="กำลังดำเนินการ" value={REPAIRS.filter(r=>r.status==='in-progress').length} sub="ช่างกำลังลงไป" tone="primary" />
        <Stat label="เสร็จเดือนนี้" value={REPAIRS.filter(r=>r.status==='done').length} sub="ปิดงานแล้ว" />
      </div>
      <Card padding={0} style={{ marginTop: 16 }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <Tabs value={tab} onChange={setTab} options={[
            { value: 'all', label: 'ทั้งหมด', count: REPAIRS.length },
            { value: 'pending', label: 'รอรับเรื่อง', count: REPAIRS.filter(r=>r.status==='pending').length },
            { value: 'in-progress', label: 'กำลังดำเนินการ', count: REPAIRS.filter(r=>r.status==='in-progress').length },
            { value: 'done', label: 'เสร็จสิ้น', count: REPAIRS.filter(r=>r.status==='done').length },
          ]} />
        </div>
        <table className="tu-table">
          <thead><tr><th>เลขที่</th><th>ห้อง / ผู้แจ้ง</th><th>หมวด</th><th>รายละเอียด</th><th>วันที่</th><th>ช่าง</th><th>ความเร่งด่วน</th><th>สถานะ</th></tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="tu-row-hover" onClick={() => setSelected(r)}>
                <td style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11.5 }}>{r.id}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{r.room}</div>
                  <div className="tu-muted" style={{ fontSize: 11.5 }}>{r.tenant}</div>
                </td>
                <td>{r.category}</td>
                <td className="tu-muted" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.issue}</td>
                <td className="tu-muted" style={{ fontSize: 12 }}>{r.date}</td>
                <td>{r.assignee || <span className="tu-muted">—</span>}</td>
                <td><Badge tone={{ high: 'red', medium: 'amber', low: 'neutral' }[r.priority]}>{{ high: 'สูง', medium: 'ปานกลาง', low: 'ต่ำ' }[r.priority]}</Badge></td>
                <td><Badge tone={RPR_STATUS[r.status].tone} dot>{RPR_STATUS[r.status].th}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <RepairModal repair={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function RepairModal({ repair, onClose }) {
  if (!repair) return null;
  return (
    <Modal open={!!repair} onClose={onClose} title={`แจ้งซ่อม ${repair.id}`} width={520}
      footer={<>
        <Button variant="secondary" onClick={onClose}>ปิด</Button>
        {repair.status === 'pending' && <Button>มอบหมายช่าง</Button>}
        {repair.status === 'in-progress' && <Button icon={I.check}>ปิดงาน</Button>}
      </>}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Badge tone={RPR_STATUS[repair.status].tone} dot>{RPR_STATUS[repair.status].th}</Badge>
        <Badge tone={{ high: 'red', medium: 'amber', low: 'neutral' }[repair.priority]}>ความเร่งด่วน: {{ high: 'สูง', medium: 'ปานกลาง', low: 'ต่ำ' }[repair.priority]}</Badge>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <KV label="ห้อง" value={repair.room} />
        <KV label="ผู้แจ้ง" value={repair.tenant} />
        <KV label="หมวด" value={repair.category} />
        <KV label="วันที่แจ้ง" value={repair.date} />
        <KV label="ช่างผู้รับ" value={repair.assignee || 'ยังไม่มอบหมาย'} />
        {repair.completedAt && <KV label="ปิดงานเมื่อ" value={repair.completedAt} />}
      </div>
      <div style={{ marginTop: 16 }}>
        <div className="tu-muted" style={{ fontSize: 12, marginBottom: 6 }}>รายละเอียดที่ผู้เข้าพักแจ้ง</div>
        <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 10, fontSize: 13.5 }}>{repair.issue}</div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div className="tu-muted" style={{ fontSize: 12, marginBottom: 6 }}>บันทึกภายใน</div>
        <Input rows={3} value="" placeholder="เพิ่มบันทึกถึงทีมช่าง..." onChange={()=>{}} />
      </div>
    </Modal>
  );
}

// ─── Promotions ────────────────────────────────────────────────────────────
function AdminPromos() {
  const [composing, setComposing] = React.useState(false);
  const [draft, setDraft] = React.useState({ title: '', body: '', cover: 'green', channels: ['line'] });
  const [sent, setSent] = React.useState(false);

  return (
    <div className="tu-page">
      <PageHeader title="โปรโมชั่น & ข่าวสาร" subtitle="Promotions — สร้างและส่งข่าวผ่าน LINE / Facebook / Web"
        actions={<Button size="sm" icon={I.plus} onClick={() => { setComposing(true); setSent(false); }}>สร้างโปรโมชั่น</Button>} />
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>โปรโมชั่นและข่าวที่กำลังเผยแพร่</div>
            <button className="tu-link">ดูประวัติ →</button>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {PROMOTIONS.map(p => <PromoRow key={p.id} promo={p} />)}
          </div>
        </Card>
        <Card>
          {composing ? (
            sent ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,196,93,.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#06c755', marginBottom: 12 }}>{I.line}</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>ส่งข่าวสารผ่าน LINE สำเร็จ</div>
                <div className="tu-muted" style={{ fontSize: 12, marginTop: 6 }}>ส่งถึงผู้เข้าพัก 38 คน ที่ติดตาม Official Account</div>
                <div style={{ marginTop: 18, display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <Button variant="secondary" onClick={() => { setComposing(false); setSent(false); }}>กลับ</Button>
                  <Button onClick={() => { setDraft({ title: '', body: '', cover: 'green', channels: ['line'] }); setSent(false); }}>สร้างอันใหม่</Button>
                </div>
              </div>
            ) : (
              <ComposePromo draft={draft} setDraft={setDraft} onCancel={() => setComposing(false)} onSend={() => setSent(true)} />
            )
          ) : (
            <ChannelStats />
          )}
        </Card>
      </div>
    </div>
  );
}

function PromoRow({ promo }) {
  return (
    <div className="tu-promo-row">
      <div style={{
        width: 76, height: 76, borderRadius: 12, flexShrink: 0,
        background: ({
          green: 'linear-gradient(135deg, #166534, #22a857)',
          lime: 'linear-gradient(135deg, #65A30D, #a3e635)',
          forest: 'linear-gradient(135deg, #14532d, #4d7c0f)',
          sage: 'linear-gradient(135deg, #84a98c, #cad2c5)',
        })[promo.cover],
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
      }}>{I.promos}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
          <Badge tone="green" size="sm">{promo.tag}</Badge>
          <span className="tu-muted" style={{ fontSize: 11.5 }}>เผยแพร่ {formatDate(promo.published)}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{promo.title}</div>
        <div className="tu-muted" style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{promo.body}</div>
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {promo.channels.includes('line') && <ChannelChip channel="line" />}
        {promo.channels.includes('fb') && <ChannelChip channel="fb" />}
        {promo.channels.includes('web') && <ChannelChip channel="web" />}
      </div>
    </div>
  );
}

function ChannelChip({ channel }) {
  const map = {
    line: { bg: '#06c755', icon: I.line, label: 'LINE' },
    fb:   { bg: '#1877f2', icon: I.fb, label: 'FB' },
    web:  { bg: 'var(--text)', icon: '⌘', label: 'Web' },
  }[channel];
  return (
    <span title={map.label} style={{
      width: 28, height: 28, borderRadius: '50%', background: map.bg, color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
    }}>{map.icon}</span>
  );
}

function ChannelStats() {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>ช่องทางสื่อสาร</div>
      <div className="tu-muted" style={{ fontSize: 12, marginBottom: 16 }}>ผู้ติดตามและการมีส่วนร่วม 30 วันล่าสุด</div>
      {[
        { ch: 'line', name: 'LINE Official', followers: 412, growth: '+18', engage: '24%' },
        { ch: 'fb',   name: 'Facebook Page', followers: 1284, growth: '+42', engage: '8%' },
        { ch: 'web',  name: 'หน้าเว็บ', followers: '—', growth: '2.1k visits', engage: '—' },
      ].map(s => (
        <div key={s.ch} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <ChannelChip channel={s.ch} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.name}</div>
            <div className="tu-muted" style={{ fontSize: 11.5 }}>{s.growth} • engagement {s.engage}</div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{s.followers}</div>
        </div>
      ))}
    </div>
  );
}

function ComposePromo({ draft, setDraft, onCancel, onSend }) {
  const upd = (k, v) => setDraft(p => ({ ...p, [k]: v }));
  const toggleCh = (c) => setDraft(p => ({ ...p, channels: p.channels.includes(c) ? p.channels.filter(x => x !== c) : [...p.channels, c] }));
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>สร้างโปรโมชั่นใหม่</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input label="หัวข้อ" value={draft.title} onChange={(v) => upd('title', v)} placeholder="ส่วนลดค่าเช่าเดือนแรก 10%" />
        <Input label="รายละเอียด" rows={4} value={draft.body} onChange={(v) => upd('body', v)} placeholder="เขียนข้อความที่จะส่งถึงผู้ติดตาม" />
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>ภาพปก</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['green','lime','forest','sage'].map(c => (
              <button key={c} onClick={() => upd('cover', c)} style={{
                width: 56, height: 36, borderRadius: 8, border: draft.cover === c ? '2px solid var(--text)' : '1px solid var(--border)', cursor: 'pointer',
                background: ({
                  green: 'linear-gradient(135deg, #166534, #22a857)',
                  lime: 'linear-gradient(135deg, #65A30D, #a3e635)',
                  forest: 'linear-gradient(135deg, #14532d, #4d7c0f)',
                  sage: 'linear-gradient(135deg, #84a98c, #cad2c5)',
                })[c],
              }} />
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>ส่งผ่านช่องทาง</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['line','fb','web'].map(c => {
              const active = draft.channels.includes(c);
              const meta = { line: { n: 'LINE', bg: '#06c755' }, fb: { n: 'Facebook', bg: '#1877f2' }, web: { n: 'หน้าเว็บ', bg: 'var(--text)' } }[c];
              return (
                <button key={c} onClick={() => toggleCh(c)} style={{
                  padding: '8px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500,
                  border: active ? `2px solid ${meta.bg}` : '1px solid var(--border)',
                  background: active ? meta.bg : 'var(--surface)',
                  color: active ? '#fff' : 'var(--text)',
                  transition: 'all .15s',
                }}>{meta.n}</button>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onCancel}>ยกเลิก</Button>
        <Button onClick={onSend} disabled={!draft.title} icon={I.line}>ส่งทันที</Button>
      </div>
    </div>
  );
}

// ─── Contact (small page) ────────────────────────────────────────────────
function AdminContact() {
  return (
    <div className="tu-page">
      <PageHeader title="ติดต่อหอพัก" subtitle="Contact — ข้อมูลที่ปรากฏให้ผู้เข้าพักเห็น" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>ช่องทางติดต่อ</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ContactRow icon={I.phone} label="Mobile" value="081-234-5678 / 052-123-456" bg="#fde2c8" fg="#b35a1f" />
            <ContactRow icon={I.line} label="LINE Official" value="@taiunt-mansion" bg="rgba(6,199,85,.12)" fg="#06c755" />
            <ContactRow icon={I.fb} label="Facebook" value="fb.com/TaiUntMansionPark" bg="rgba(24,119,242,.12)" fg="#1877f2" />
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>ที่อยู่และเวลาทำการ</div>
          <KV label="ที่อยู่" value="123 ถ.ตัวอย่าง อ.เมือง จ.เชียงใหม่ 50000" />
          <div style={{ height: 12 }} />
          <KV label="เวลาทำการ" value="จันทร์–เสาร์ 08:00–20:00 / อาทิตย์ 09:00–17:00" />
          <div style={{ height: 12 }} />
          <KV label="ฉุกเฉิน" value="081-234-5678 (24 ชม.)" />
        </Card>
      </div>
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

// ─── shared bits ─────────────────────────────────────────────────────────
function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4, gap: 16 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.01em' }}>{title}</div>
        {subtitle && <div className="tu-muted" style={{ fontSize: 13, marginTop: 4 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{children}</div>;
}

function KV({ label, value }) {
  return (
    <div>
      <div className="tu-muted" style={{ fontSize: 11.5, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function Avatar({ name, size = 36 }) {
  const initial = (name || '?').replace(/^คุณ/, '').slice(0, 1);
  const colors = ['#166534', '#65A30D', '#84a98c', '#52796f', '#354f52'];
  const hash = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const bg = colors[hash % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: 600, flexShrink: 0 }}>{initial}</div>
  );
}

function formatDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return `${d.getDate()} ${months[d.getMonth()]} ${(d.getFullYear() + 543).toString().slice(-2)}`;
}

Object.assign(window, {
  AdminDashboard, AdminRooms, AdminTenants, AdminBilling, AdminRepairs, AdminPromos, AdminContact,
  PageHeader, SectionTitle, KV, Avatar, formatDate, ChannelChip,
});
