# Undangan Baptisan Anak

Website publik melalui GitHub Pages, admin di `admin.html` dengan Firebase Google/email.

Admin: profil anak, orang tua/wali baptis, ayat, jadwal dan gereja, syukuran opsional, enam tema, sampul/slideshow/galeri, musik, rekening, ucapan dan RSVP. Tekan **Simpan Semua Perubahan** untuk menerbitkan perubahan data; unggah foto menyimpan langsung.

Tetap memakai koleksi `invitationTamanRomantis` dan `invitationTamanRomantisResponses` milik proyek ini. Koleksi undangan lain tidak diubah. `contentType: baptisan` menandai data baru. Sebelum simpan pertama, tulisan pernikahan diganti data contoh baptisan; media dan tema sebelumnya dipertahankan. Login/simpan memerlukan provider Auth, authorized domain, dan Rules Firebase yang sesuai. Jangan menaruh password atau token dalam kode.

Jalankan `npm test` untuk validasi. File root merupakan sumber aktif GitHub Pages; direktori `source` adalah arsip implementasi terdahulu.
