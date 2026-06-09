# Sakura Birthday Premium Online 💗🌸

Fitur:
- Edit surat dari admin online
- Atur lagu menu utama
- Atur lagu khusus tiap surat
- Tambah/hapus foto di Our Memories
- Tema, efek, countdown, ending message
- Bisa Supabase online, fallback localStorage kalau Supabase belum diisi

## Deploy Vercel
Framework Preset: Other  
Build Command: kosong  
Output Directory: kosong / `./`

## Admin
Buka:
`/admin.html`

Password awal:
`sakura`

## Supabase Online
1. Buat project di Supabase.
2. Buka SQL Editor.
3. Copy semua isi `SUPABASE_SETUP.sql`, lalu Run.
4. Buka Project Settings > API.
5. Copy Project URL dan anon public key.
6. Buka file `supabase-config.js`.
7. Isi:

```js
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "xxxxx";
```

8. Upload lagi semua file ke GitHub, commit, lalu redeploy Vercel.

Kalau status admin muncul `Mode online Supabase aktif`, berarti berhasil.


## Update Fixed
- Default tanggal ulang tahun: 10 Juni 2026
- Countdown sudah mode ulang tahun
- Motion effect ditambah: glowing title, floating card, animated button, moving blob background
- Tetap support Supabase online lewat `supabase-config.js`

## Supabase penting
Isi `supabase-config.js` dengan:
- Project URL
- anon public key

Run file:
`SUPABASE_SETUP.sql`
di Supabase SQL Editor.
