# Undangan Baptisan Anak

Website publik melalui GitHub Pages, admin di `admin.html` dengan Firebase Google/email.

Admin: profil anak, orang tua/wali baptis, ayat, jadwal dan gereja, syukuran opsional, enam tema, sampul/slideshow/galeri, musik, rekening, ucapan dan RSVP. Tekan **Simpan Semua Perubahan** untuk menerbitkan perubahan data; unggah foto menyimpan langsung.

Tetap memakai koleksi `invitationTamanRomantis` dan `invitationTamanRomantisResponses` milik proyek ini. Koleksi undangan lain tidak diubah. `contentType: baptisan` menandai data baru. Sebelum simpan pertama, tulisan pernikahan diganti data contoh baptisan; media dan tema sebelumnya dipertahankan. Login/simpan memerlukan provider Auth, authorized domain, dan Rules Firebase yang sesuai. Jangan menaruh password atau token dalam kode.

Jalankan `npm test` untuk validasi. File root merupakan sumber aktif GitHub Pages; direktori `source` adalah arsip implementasi terdahulu.

## Desain referensi baptisan

Tema biru pastel dengan latar awan, bintang, balon udara, malaikat kecil, bingkai lengkung dan galeri foto besar. Semua hiasan berupa SVG lokal. Foto placeholder diganti melalui admin. Peta dibuat dari nama tempat/alamat yang diisi; tautan Maps khusus tetap diprioritaskan. Transisi pembuka berupa crossfade, dan animasi dinonaktifkan bila perangkat meminta reduced motion.

## Pengaturan terbaru

Nama ayah/ibu disimpan dalam field terpisah dan ditampilkan rata tengah dengan ampersand pada baris tersendiri. Data gabungan lama otomatis dipisah saat dibaca. Cerita kosong memakai narasi doa/syukur bawaan tanpa mengubah cerita pribadi yang sudah diisi. Form admin memuat hasilnya dan menyimpannya saat pengguna menekan Simpan. Hadiah/rekening dan pengaturan yang tidak dipakai di halaman publik dihapus dari antarmuka. Foto memakai animasi zoom perlahan dengan dukungan reduced motion.

## Pemuatan foto

Sampul diprioritaskan dan langsung tampil saat selesai, tanpa menunggu foto keluarga. Bagian lain tampil progresif. Loader bersama membatasi unduhan menjadi empat sekaligus, menggabungkan permintaan ID yang sama, dan menyimpan hingga 40 foto di IndexedDB. Kegagalan cache tidak menghentikan foto online. Foto unggahan baru memakai ID unik sehingga versi baru tidak tertukar dengan cache.

## Musik dan gulir otomatis

File musik kiriman pengguna dipasang utuh di `audio/mary-star-li.mp3` (sekitar 60 detik), diputar berulang setelah tombol Buka Undangan ditekan. Rilis musik mengganti konfigurasi sebelumnya sekali saat dibaca; perubahan musik berikutnya dari admin tetap dihormati. Gulir otomatis mulai sesudah transisi, dapat dijeda/dilanjutkan, berhenti saat interaksi, pindah tab, membuka foto, atau mencapai akhir halaman. Admin dapat menonaktifkan mulai otomatis dan memilih kecepatan. Perangkat dengan reduced motion tidak mulai menggulir sendiri.
