# Panduan Setup Supabase untuk RSVP Buku Tamu

Undangan ini sekarang menggunakan **Supabase** sebagai backend RSVP (digantikan Google Apps Script / Spreadsheet). Ikuti langkah di bawah untuk mengaktifkannya.

---

## 1. Buat Project Supabase

1. Buka <https://supabase.com> dan login dengan akun Anda.
2. Klik **"New Project"**, pilih organisation, beri nama project (mis. `rida-wedding-rsvp`).
3. Tunggu hingga project selesai dibuat (biasanya ~1 menit).

---

## 2. Buat Tabel `rsvps`

Di **SQL Editor** di dashboard Supabase, jalankan query berikut:

```sql
-- Enable Realtime (opsional, untuk fitur lanjutan)
-- create extension if not exists pgcrypto;

create table rsvps (
  id uuid default gen_random_uuid() primary key,
  nama text not null,
  ucapan text not null,
  konfirmasi text not null,
  jumlah text default '',
  created_at timestamptz default now()
);

-- Aktifkan Row Level Security (RLS)
alter table rsvps enable row level security;

-- Izinkan semua orang membaca data (untuk tampilan wish wall)
create policy "Public read access" on rsvps
  for select using (true);

-- Izinkan semua orang memasukkan data (untuk form RSVP tamu)
create policy "Public insert access" on rsvps
  for insert with check (true);
```

> 🔒 RLS diaktifkan: hanya Anda (melalui Supabase Dashboard) yang bisa menghapus/mengedit data. Tamu hanya bisa **baca** dan **tambah** data baru.

---

## 3. Dapatkan URL dan Anon Key

1. Di dashboard Supabase, buka **Settings → API**.
2. Catat:
   - **Project URL** → contoh: `https://abcdefghijklmnop.supabase.co`
   - **anon public** key → contoh: `eyJhbGciOiJIUzI1NiIs...`

---

## 4. Konfigurasi di `js/main.js`

Buka file `d:\ITAMA\Garapan\ridawedding\js\main.js`, cari baris ini:

```js
const SUPABASE_URL = "https://<project-ref>.supabase.co";
const SUPABASE_ANON_KEY = "<anon-key>";
```

Ganti dengan nilai asli dari langkah 3:

```js
const SUPABASE_URL = "https://abcdefghijklmnop.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIs...";
```

Simpan file.

---

## 5. Hapus Pesan Melalui Supabase Dashboard

Karena **tombol hapus telah dihapus dari undangan**, untuk menghapus ucapan RSVP:

1. Buka <https://supabase.com> → project Anda → **Table Editor**.
2. Pilih tabel `rsvps`.
3. Pilih baris yang ingin dihapus → klik ikon **🗑️ Delete**.
4. Konfirmasi penghapusan.

---

## 6. Struktur Data yang Disimpan

Setiap entri RSVP akan memiliki kolom berikut:

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | uuid | Primary key (otomatis) |
| `nama` | text | Nama tamu |
| `ucapan` | text | Pesan / doa |
| `konfirmasi` | text | `Akan Hadir` atau `Tidak Dapat Hadir` |
| `jumlah` | text | Jumlah tamu (termasuk diri sendiri) |
| `created_at` | timestamptz | Waktu entri dibuat |

---

## 7. Catatan Penting

- Ganti `<project-ref>` dan `<anon-key>` di `js/main.js` **sebelum** membuka undangan di browser.
- Jika URL project berubah (mis. setelah reset project), pastikan untuk memperbarikannya juga di `js/main.js`.
- Tidak ada tombol hapus di sisi tamu — semua pengelolaan data dilakukan melalui Supabase Dashboard Anda.