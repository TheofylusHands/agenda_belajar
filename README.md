# Study Nest ✨

Versi pengembangan dari agenda belajar yang diunggah. Tampilan login netral tanpa daftar identitas, desain playful responsif, dan modul belajar terintegrasi.

## Menjalankan

Buka `dist/index.html` di browser dengan local server/hosting HTTPS. Untuk fitur Notification API dan integrasi cloud, gunakan HTTPS. Data lama pada origin yang sama diambil dari `sinau_v2` dan `sinau_agenda_v1`.

Pada pemakaian pertama, klik **Buat akun lokal**, tentukan ID dan sandi. Di browser yang sudah memakai versi lama, gunakan ID dan sandi lokal yang sebelumnya terdaftar.

## Fitur

- Kalender bulanan dan ekspor `.ics` (berisi sesi mingguan, deadline, ujian, dan tutor)
- Countdown ujian dan tenggat dengan cakupan materi
- Flashcards dua sisi dan pencarian cheatsheet rumus
- Catatan soal salah dan review
- Agenda tutor, PR, kehadiran, dan ringkasan pertemuan
- Browser reminders saat aplikasi terbuka dan izin notifikasi diberikan
- Simulasi nilai berbobot dengan bobot dan target yang dapat disesuaikan
- XP, streak, badge, target mingguan, dan papan peringkat lokal
- Perpustakaan tautan PDF/slide/video/Binusmaya, pencarian global
- Backup JSON, pemulihan data, dan koneksi Supabase Auth + Row Level Security (opsional)

## Mengaktifkan Supabase lintas perangkat

1. Buat proyek Supabase; aktifkan autentikasi Email.
2. Jalankan isi `supabase_setup.sql` pada SQL Editor.
3. Buka aplikasi, pilih **Masuk via Supabase**, isi Project URL, **anon/publishable key** (jangan `service_role`), ID profil, email, sandi.
4. Pilih **Daftar cloud**, verifikasi email jika diminta, lalu **Masuk & sinkronkan**.
5. Gunakan akun email yang sama di perangkat berikutnya. Data per akun disimpan pada tabel dengan kebijakan akses RLS.

Cloud baru aktif setelah langkah tersebut dilakukan. Tanpa konfigurasi, semua data tetap tersimpan lokal di browser. Sinkronisasi menggunakan penulisan data setelah perubahan dan pemuatan saat masuk; pembaruan simultan di dua perangkat belum memiliki resolusi konflik tingkat lanjut. Notifikasi ketika web tertutup memerlukan service worker + push service atau kalender `.ics` yang diimpor ke kalender perangkat. File PDF fisik belum diunggah; perpustakaan menyimpan URL.
