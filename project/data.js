// Mock data for TaiUnt Mansion Park
(function(){
const today = new Date('2026-05-26');

// Generate 40 rooms across 4 floors, 10 rooms per floor
// Floors 1-3 monthly, floor 4 mixed monthly/daily
const ROOMS = (() => {
  const statuses = {
    monthly: ['vacant', 'booked', 'occupied', 'notice', 'maintenance'],
    daily: ['vacant', 'booked', 'occupied', 'cleaning'],
  };
  // Pre-baked layout so dashboard numbers look realistic and stable
  const layout = [
    // Floor 1
    'occupied','occupied','vacant','occupied','occupied','booked','occupied','vacant','occupied','occupied',
    // Floor 2
    'occupied','occupied','occupied','notice','occupied','occupied','vacant','occupied','occupied','maintenance',
    // Floor 3
    'occupied','vacant','occupied','occupied','occupied','occupied','booked','occupied','occupied','occupied',
    // Floor 4 (daily)
    'occupied','vacant','booked','occupied','cleaning','vacant','occupied','occupied','vacant','booked',
  ];
  const rooms = [];
  const firstNames = ['สมชาย','สมหญิง','ปริญญา','ณัฐวุฒิ','พิมพ์ชนก','ธนพร','กิตติพงษ์','อรอนงค์','วรพล','ชนาภัทร','เมธี','สุพรรษา','ปรีชา','ภัทรดา','กฤษดา','ลลิตา','ธีระ','นันท์นภัส','อาทิตย์','ปัทมา'];
  const lastNames = ['ใจดี','รักดี','พงศ์ศักดิ์','วงศ์สุข','ศรีสุข','ทองคำ','เจริญพร','สายทอง','ศรีวิชัย','พรหมมา'];
  let nameIdx = 0;
  for (let f = 1; f <= 4; f++) {
    for (let r = 1; r <= 10; r++) {
      const i = (f - 1) * 10 + (r - 1);
      const type = f === 4 ? 'daily' : 'monthly';
      const status = layout[i];
      const id = `${f}${String(r).padStart(2, '0')}`;
      const occupied = status === 'occupied' || status === 'notice';
      const tenant = occupied
        ? `คุณ${firstNames[nameIdx % firstNames.length]} ${lastNames[(nameIdx++) % lastNames.length]}`
        : null;
      const checkIn = occupied
        ? new Date(today.getFullYear(), today.getMonth() - Math.floor(Math.random()*6) - 1, Math.floor(Math.random()*28)+1)
        : null;
      rooms.push({
        id, floor: f, number: r, type, status, tenant,
        checkIn: checkIn ? checkIn.toISOString().slice(0,10) : null,
        rent: type === 'monthly' ? 4000 : 500,
        size: type === 'monthly' ? 24 : 18,
        bed: type === 'monthly' ? 'เตียงคู่' : 'เตียงเดี่ยว',
      });
    }
  }
  return rooms;
})();

const TENANTS = ROOMS.filter(r => r.tenant).map((r, i) => ({
  id: `T${String(i+1).padStart(4,'0')}`,
  name: r.tenant,
  room: r.id,
  type: r.type,
  phone: `08${Math.floor(10000000 + Math.random()*89999999)}`,
  idCard: `1-${1000 + i}-${10000 + i*7 % 99999}-${10 + i % 89}-${i % 9}`,
  checkIn: r.checkIn,
  deposit: r.type === 'monthly' ? 5000 : 200,
  status: r.status,
}));

// Invoices for monthly tenants
const INVOICES = (() => {
  const out = [];
  const monthlyTenants = TENANTS.filter(t => t.type === 'monthly');
  monthlyTenants.forEach((t, i) => {
    // Current month invoice
    const water = 4 + (i % 6); // units
    const elec = 80 + (i * 13 % 120); // units
    const items = [
      { label: 'ค่าเช่าห้อง (พ.ค. 2569)', qty: 1, unit: 'เดือน', price: 4000, amount: 4000 },
      { label: 'ค่าน้ำประปา', qty: water, unit: 'หน่วย', price: 25, amount: water * 25 },
      { label: 'ค่าไฟฟ้า', qty: elec, unit: 'หน่วย', price: 8, amount: elec * 8 },
    ];
    if (i % 5 === 0) items.push({ label: 'ค่าบริการอินเตอร์เน็ต', qty: 1, unit: 'เดือน', price: 200, amount: 200 });
    const total = items.reduce((s, it) => s + it.amount, 0);
    const statuses = ['paid','paid','pending','overdue','paid','pending','paid'];
    const st = statuses[i % statuses.length];
    out.push({
      id: `INV-2026-05-${String(i+1).padStart(3,'0')}`,
      tenantId: t.id, room: t.room, tenantName: t.name,
      type: 'monthly',
      period: 'พฤษภาคม 2569',
      issueDate: '2026-05-25',
      dueDate: '2026-06-05',
      items, total,
      status: st,
      paidAt: st === 'paid' ? '2026-05-' + String(20 + (i % 7)) : null,
      paymentMethod: st === 'paid' ? ['โอนผ่าน QR PromptPay','โอนธนาคาร','เงินสด'][i % 3] : null,
    });
  });
  // Daily invoices (a few stays)
  const dailyTenants = TENANTS.filter(t => t.type === 'daily').slice(0, 4);
  dailyTenants.forEach((t, i) => {
    const nights = 2 + (i % 5);
    const items = [
      { label: `ค่าเช่าห้องรายวัน (${nights} คืน)`, qty: nights, unit: 'คืน', price: 500, amount: nights * 500 },
      { label: 'ค่ามัดจำกุญแจ', qty: 1, unit: 'ครั้ง', price: 200, amount: 200 },
    ];
    const total = items.reduce((s, it) => s + it.amount, 0);
    out.push({
      id: `INV-2026-05-D${String(i+1).padStart(2,'0')}`,
      tenantId: t.id, room: t.room, tenantName: t.name,
      type: 'daily',
      period: `${nights} คืน`,
      issueDate: '2026-05-' + String(22 + i),
      dueDate: '2026-05-' + String(22 + i + nights),
      items, total,
      status: i < 2 ? 'paid' : 'pending',
      paidAt: i < 2 ? '2026-05-' + String(22 + i) : null,
      paymentMethod: i < 2 ? 'โอนผ่าน QR PromptPay' : null,
    });
  });
  return out;
})();

const REPAIRS = [
  { id: 'RPR-2026-038', room: '203', tenant: 'คุณพิมพ์ชนก ใจดี', type: 'monthly', category: 'แอร์', issue: 'แอร์ไม่เย็น มีน้ำหยด', date: '2026-05-24 09:12', status: 'in-progress', priority: 'high', assignee: 'ช่างสมศักดิ์' },
  { id: 'RPR-2026-037', room: '305', tenant: 'คุณกิตติพงษ์ ทองคำ', type: 'monthly', category: 'ไฟฟ้า', issue: 'ปลั๊กในห้องน้ำใช้ไม่ได้', date: '2026-05-23 18:40', status: 'pending', priority: 'medium', assignee: null },
  { id: 'RPR-2026-036', room: '402', tenant: 'คุณวรพล ศรีสุข', type: 'daily', category: 'ประปา', issue: 'ก๊อกน้ำในห้องน้ำรั่ว', date: '2026-05-23 14:05', status: 'done', priority: 'low', assignee: 'ช่างวินัย', completedAt: '2026-05-24 11:00' },
  { id: 'RPR-2026-035', room: '108', tenant: 'คุณอรอนงค์ พงศ์ศักดิ์', type: 'monthly', category: 'อื่นๆ', issue: 'ประตูตู้เสื้อผ้าหลุด', date: '2026-05-22 21:30', status: 'pending', priority: 'low', assignee: null },
  { id: 'RPR-2026-034', room: '210', tenant: 'คุณนันท์นภัส วงศ์สุข', type: 'monthly', category: 'แอร์', issue: 'รีโมตแอร์ไม่ทำงาน', date: '2026-05-22 10:00', status: 'in-progress', priority: 'medium', assignee: 'ช่างสมศักดิ์' },
  { id: 'RPR-2026-033', room: '301', tenant: 'คุณธนพร เจริญพร', type: 'monthly', category: 'อินเตอร์เน็ต', issue: 'WiFi หลุดบ่อย', date: '2026-05-21 16:22', status: 'done', priority: 'medium', assignee: 'ช่างวินัย', completedAt: '2026-05-22 09:30' },
];

const PROMOTIONS = [
  { id: 'PRM-01', title: 'จองล่วงหน้า 3 เดือน รับส่วนลด 10%', body: 'จองและชำระค่ามัดจำภายใน 31 พ.ค. นี้ รับส่วนลดค่าเช่าเดือนแรกทันที 10% สำหรับห้องรายเดือนทุกประเภท', cover: 'green', tag: 'แนะนำ', published: '2026-05-20', channels: ['line','fb','web'], status: 'live' },
  { id: 'PRM-02', title: 'รายวัน 4 คืน เหลือ 1,800 บาท', body: 'แพ็คเกจรายวัน 4 คืน เพียง 1,800 บาท (ปกติ 2,000) ฟรี WiFi และที่จอดรถ', cover: 'lime', tag: 'ใหม่', published: '2026-05-18', channels: ['line','fb'], status: 'live' },
  { id: 'PRM-03', title: 'ค่าน้ำค่าไฟเดือนแรกบ้านพี่ออก', body: 'สำหรับผู้เข้าพักใหม่รายเดือน ทางหอจะคิดค่าน้ำค่าไฟเดือนแรกให้ฟรี (สูงสุด 800 บาท)', cover: 'forest', tag: 'พิเศษ', published: '2026-05-12', channels: ['line','web'], status: 'live' },
  { id: 'PRM-04', title: 'ชวนเพื่อน รับเครดิต 500 บาท', body: 'แนะนำเพื่อนเข้าพักรายเดือน รับเครดิตคนละ 500 บาท นำไปใช้ลดค่าเช่าเดือนถัดไป', cover: 'sage', tag: 'รีเฟอร์รัล', published: '2026-05-05', channels: ['line'], status: 'scheduled' },
];

const ANNOUNCEMENTS = [
  { id: 'ANN-01', title: 'แจ้งตัดน้ำชั่วคราว 28 พ.ค.', body: 'การประปาแจ้งซ่อมท่อ จะหยุดจ่ายน้ำชั่วคราว 09:00–13:00 ขออภัยในความไม่สะดวก', date: '2026-05-26' },
  { id: 'ANN-02', title: 'ปรับเวลาเข้าออกประตูหลัก', body: 'เริ่ม 1 มิ.ย. 69 ประตูหลักจะปิดอัตโนมัติเวลา 23:00 ผู้เข้าพักโปรดใช้คีย์การ์ดผ่านประตูข้าง', date: '2026-05-24' },
];

// Dashboard time series — last 6 months revenue
const REVENUE = [
  { m: 'ธ.ค.', monthly: 142000, daily: 18500 },
  { m: 'ม.ค.', monthly: 148000, daily: 21000 },
  { m: 'ก.พ.', monthly: 144000, daily: 16500 },
  { m: 'มี.ค.', monthly: 152000, daily: 23000 },
  { m: 'เม.ย.', monthly: 156000, daily: 19500 },
  { m: 'พ.ค.', monthly: 158000, daily: 25500 },
];

// Status helpers
const STATUS_META = {
  vacant:      { th: 'ว่าง',         en: 'Vacant',      tone: 'neutral' },
  booked:      { th: 'จอง',          en: 'Booked',      tone: 'amber' },
  occupied:    { th: 'เข้าพัก',       en: 'Occupied',    tone: 'green' },
  notice:      { th: 'แจ้งออก',       en: 'Notice',      tone: 'orange' },
  maintenance: { th: 'ปิดซ่อม',       en: 'Maintenance', tone: 'red' },
  cleaning:    { th: 'ทำความสะอาด',   en: 'Cleaning',    tone: 'blue' },
};

const INV_STATUS = {
  paid:    { th: 'ชำระแล้ว',  en: 'Paid',    tone: 'green' },
  pending: { th: 'รอชำระ',    en: 'Pending', tone: 'amber' },
  overdue: { th: 'เกินกำหนด', en: 'Overdue', tone: 'red' },
};

const RPR_STATUS = {
  pending:     { th: 'รอรับเรื่อง', en: 'Pending',     tone: 'amber' },
  'in-progress': { th: 'กำลังดำเนินการ', en: 'In progress', tone: 'blue' },
  done:        { th: 'เสร็จสิ้น',    en: 'Done',        tone: 'green' },
};

Object.assign(window, {
  TUMP_DATA: { ROOMS, TENANTS, INVOICES, REPAIRS, PROMOTIONS, ANNOUNCEMENTS, REVENUE, STATUS_META, INV_STATUS, RPR_STATUS },
});
})();
