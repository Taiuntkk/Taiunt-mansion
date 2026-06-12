# ตั้งค่าฐานข้อมูล + Deploy เว็บ — TaiUnt Mansion Park

คู่มือนี้พาคุณจากศูนย์ไปจนถึง "มีฐานข้อมูลจริงและเว็บออนไลน์" โดยใช้บริการที่
**เริ่มต้นใช้งานฟรี** ทั้งคู่:

| ส่วนงาน | บริการที่แนะนำ | ฟรีแค่ไหน |
|---|---|---|
| ฐานข้อมูล + ระบบล็อกอิน | **[Supabase](https://supabase.com)** (Postgres) | ฐานข้อมูล 500MB, Auth ไม่จำกัดผู้ใช้, ใช้ฟรีตลอดไป |
| โฮสติ้งเว็บ | **[Cloudflare Pages](https://pages.cloudflare.com)** | Bandwidth ไม่จำกัด, ฟรีถาวร |

---

## ส่วนที่ 1 — สร้างฐานข้อมูลบน Supabase

### 1.1 สมัครและสร้างโปรเจกต์
1. ไปที่ https://supabase.com → กด **Start your project** → สมัครด้วยอีเมลหรือ GitHub
2. กด **New project** → ตั้งชื่อ เช่น `taiunt-mansion` → ตั้งรหัสผ่านฐานข้อมูล (เก็บไว้ดีๆ) → เลือก region ใกล้ไทย เช่น Singapore → กด **Create new project** (รอ ~2 นาที)

### 1.2 สร้างตารางทั้งหมดในฐานข้อมูล
1. ในเมนูซ้าย กด **SQL Editor** → **New query**
2. เปิดไฟล์ `database/schema.sql` (อยู่ในโฟลเดอร์ที่ผมส่งให้) → คัดลอกทั้งหมด → วางในช่อง SQL Editor
3. กด **Run** — จะสร้างตาราง 20+ ตาราง พร้อมระบบความปลอดภัยระดับแถว (Row Level Security) ที่:
   - ผู้ดูแล (admin) เห็น/แก้ไขได้ทุกอย่าง
   - ผู้เข้าพัก (tenant) เห็นได้เฉพาะห้อง/บิล/รายการแจ้งซ่อมของตัวเอง

### 1.3 ใส่ข้อมูลตัวอย่าง (เหมือนในเว็บตอนนี้)
1. New query อีกครั้ง → วางเนื้อหาจาก `database/seed.sql` → กด Run
   - จะได้ห้องพัก 36 ห้อง, ผู้เข้าพัก, ใบแจ้งหนี้, รายการแจ้งซ่อม, โปรโมชั่น ฯลฯ ตั้งต้นให้ทันที

### 1.4 สร้างบัญชีผู้ใช้จริง (Auth)
1. ไปที่เมนู **Authentication** → **Users** → **Add user** → **Create new user**
2. สร้างบัญชีแอดมิน เช่น `admin@taiunt.co` ตั้งรหัสผ่านเอง (ติ๊ก "Auto Confirm User")
3. รัน SQL นี้ใน SQL Editor เพื่อกำหนดให้บัญชีนี้เป็น admin (แทน `<UUID>` ด้วย user id ที่เห็นในหน้า Users):
   ```sql
   insert into profiles (id, role, full_name)
   values ('<UUID>', 'admin', 'ผู้ดูแลระบบ');
   ```
4. ทำซ้ำสำหรับผู้เข้าพักแต่ละคน โดยตอนนี้ให้ผูก `room_id` และ `role = 'tenant'` แล้วอัปเดต `tenants.profile_id` ให้ตรงกับ user นั้น เช่น:
   ```sql
   insert into profiles (id, role, full_name, room_id)
   values ('<UUID-ของผู้เข้าพัก>', 'tenant', 'คุณสมชาย ใจดี', '101');

   update tenants set profile_id = '<UUID-ของผู้เข้าพัก>' where id = 'T0001';
   ```
   *(ในระยะยาว แนะนำให้ทำหน้า "อนุมัติผู้เข้าพักใหม่" ในฝั่งแอดมิน เพื่อให้ผู้เข้าพักสมัครเองผ่านปุ่ม Sign up แล้วแอดมินกดอนุมัติ — ผมช่วยสร้างให้ได้เมื่อพร้อมทำขั้นถัดไป)*

### 1.5 เก็บกุญแจเชื่อมต่อ (API keys)
ไปที่ **Project Settings → API** จะเห็น:
- **Project URL** (เช่น `https://xxxxx.supabase.co`)
- **anon public key** (กุญแจสาธารณะ ใช้ฝังในโค้ดหน้าเว็บได้อย่างปลอดภัย เพราะ RLS คุ้มกันอยู่)

เก็บค่าทั้งสองนี้ไว้ — ต้องใช้ตอนเชื่อมโค้ดเว็บเข้ากับฐานข้อมูลจริง (ขั้นตอนถัดไปที่ผมจะทำให้)

---

## ส่วนที่ 2 — Deploy เว็บขึ้น Cloudflare Pages

### 2.1 เตรียม repo บน GitHub
1. สร้าง repository ใหม่บน https://github.com (ฟรี) เช่น `taiunt-mansion-park`
2. อัปโหลดไฟล์ `index.html` (และโฟลเดอร์ `database/` ถ้าต้องการเก็บไว้อ้างอิง) เข้า repo นี้
   - ใช้ปุ่ม "Add file → Upload files" บนเว็บ GitHub ได้เลย ไม่ต้องใช้ command line

### 2.2 เชื่อม Cloudflare Pages กับ repo
1. ไปที่ https://dash.cloudflare.com → สมัคร/ล็อกอิน → เมนู **Workers & Pages** → **Create application** → แท็บ **Pages** → **Connect to Git**
2. เลือก repo `taiunt-mansion-park` ที่สร้างไว้
3. ตั้งค่า build:
   - **Framework preset**: None
   - **Build command**: เว้นว่างไว้ (ไม่ต้อง build เพราะเป็น static HTML)
   - **Build output directory**: `/`
4. กด **Save and Deploy** — รอ ~1 นาที จะได้ URL ฟรีรูปแบบ `https://taiunt-mansion-park.pages.dev`

จากนี้ไป **ทุกครั้งที่อัปเดตไฟล์ใน GitHub repo เว็บจะ deploy ใหม่อัตโนมัติ**

### 2.3 (ถ้าต้องการ) ใช้โดเมนของตัวเอง
Cloudflare Pages → โปรเจกต์ → **Custom domains** → เพิ่มโดเมนที่คุณมี (ฟรี ไม่มีค่าใช้จ่ายเพิ่มจาก Cloudflare)

---

## ขั้นตอนถัดไป — เชื่อมเว็บเข้ากับฐานข้อมูลจริง

ตอนนี้เว็บที่ deploy ยังใช้ **ข้อมูลจำลอง** (`window.TUMP_DATA`) อยู่ — ฐานข้อมูลที่สร้างขึ้นใหม่ยังไม่ได้เชื่อมกับหน้าเว็บ

ขั้นต่อไปที่ผมจะทำให้ (เมื่อคุณทำส่วนที่ 1.5 เสร็จและส่ง Project URL + anon key มาให้):
1. เพิ่ม Supabase JS client (โหลดผ่าน CDN เหมือน React/Babel ตอนนี้)
2. เปลี่ยนระบบ Sign in/Sign up ให้ใช้ Supabase Auth จริง
3. แทนที่การอ่าน `TUMP_DATA.ROOMS` ฯลฯ ด้วยการ query จากฐานข้อมูลจริง (พร้อม loading state)
4. ทำให้การกระทำต่างๆ (ออกบิล, รับแจ้งซ่อม, เพิ่มผู้เข้าพัก ฯลฯ) บันทึกลงฐานข้อมูลจริง แทนที่จะหายไปเมื่อ refresh

งานส่วนนี้ค่อนข้างใหญ่ (โค้ดปัจจุบันมีกว่า 40 หน้าจอ) แนะนำให้ทำทีละโมดูล เริ่มจาก **ระบบล็อกอิน + ห้องพัก/ผู้เข้าพัก** ก่อน แล้วค่อยขยายไปส่วนอื่น
