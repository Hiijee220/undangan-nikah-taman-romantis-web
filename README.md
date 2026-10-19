# Undangan Taman Romantis — Firebase + GitHub Pages

Undangan dan admin dihosting langsung di GitHub Pages. Tidak ada login ChatGPT atau token GitHub pada alur admin. Tampilan dan kelompok fitur mengikuti website contoh milik pengguna, dengan konten awal dimigrasikan dari pengaturan repositori ini.

## Koneksi

Firebase Web app: `jeivan-82577`, app ID `1:198218199725:web:e2567028a857f35e740c24`. Konfigurasi SDK Web adalah identitas aplikasi publik, bukan kredensial admin. Analytics tidak diinisialisasi.

Lokasi data baru:

- `invitationTamanRomantis/content`: isi undangan, referensi foto, revisi.
- `invitationTamanRomantis/<id-foto>`: foto JPEG terkompresi.
- `invitationTamanRomantisResponses/<id-rsvp>`: ucapan dan konfirmasi kehadiran.

Tidak ada pembacaan, penulisan, migrasi, atau penghapusan di koleksi `invitation`, `invitationResponses`, atau proyek ulang tahun.

## Persiapan Console oleh pemilik

Lihat `setup.html`. Aktifkan Google dan Email/Password pada Authentication, tambahkan `hiijee220.github.io` ke authorized domains jika belum ada, serta gabungkan `firestore-additions.rules` ke aturan yang sudah ada. Jangan menimpa seluruh Rules proyek karena proyek ini juga dipakai undangan lain. Aturan lama yang memberi izin terlalu luas tetap berlaku (Rules bersifat OR); periksa aturan lama sebelum menerbitkan tambahan.

Admin harus email `remajasilo.rs@gmail.com` yang telah diverifikasi. Pemeriksaan pada UI hanya membantu pengalaman pengguna; Rules harus menerapkan pembatasan yang sama di server.

## Fitur

Pembuka, nama tamu melalui `?to=`, enam tema, slideshow empat foto, hitung mundur WITA, dua ayat, pasangan dan Instagram, dua lokasi acara dan Maps terpisah, galeri sepuluh foto dengan lightbox, tiga bagian cerita beserta foto, musik MP3/OGG/YouTube/Drive, rekening dan konfirmasi hadiah WhatsApp, RSVP tersimpan bersama daftar ucapan dan ringkasan kehadiran, penutup, serta menu navigasi.

Admin dapat mengedit seluruh kelompok teks, tautan, foto, tema, dan musik; mengompres upload maksimal 10 MB; melepas foto galeri/slideshow; membuat link tamu; login Google/email; mengirim reset password; serta keluar. Foto yang dilepas disembunyikan dari undangan, tanpa menghapus dokumen foto lama secara permanen. Versi dokumen diperiksa dalam transaksi agar sesi lama tidak menimpa perubahan sesi baru. Data tidak dimasukkan ke localStorage sebagai pengganti penyimpanan online.

## Pemeliharaan

File utama HTML/CSS/JS langsung disajikan dari root repositori. Tidak memerlukan npm/build di HP. `npm test` atau `node tests.mjs` menjalankan pemeriksaan lokal. `defaults.js` hanya data awal/cadangan; perubahan admin disimpan dalam Firestore. Data, nomor rekening yang dipublikasikan, foto, dan ucapan dapat dilihat pengunjung.

Kode React lama tetap disimpan di `source/` untuk riwayat; halaman utama tidak lagi memakai bundle admin token GitHub. Jangan menggunakan build lama untuk menimpa versi Firebase ini.

## Batas verifikasi

Kode, konsistensi fitur, pemisahan koleksi, validasi input, konflik revisi, dan akses HTTP dapat diperiksa tanpa login pemilik. Login produksi, penulisan Firestore, serta unggah foto harus diverifikasi setelah pemilik memasang Rules dan menyelesaikan login sendiri. Konfigurasi Web bukan akses pengelolaan Firebase Console.
