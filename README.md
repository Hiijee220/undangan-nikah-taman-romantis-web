# Undangan Taman Romantis — GitHub Pages

Website undangan dan `admin.html` sepenuhnya statis, dihosting langsung di GitHub Pages. Tidak ada pengalihan ke ChatGPT atau login ChatGPT.

## Login admin

Admin memakai fine-grained personal access token GitHub dengan akses hanya ke `Hiijee220/undangan-nikah-taman-romantis-web`, izin **Contents: Read and write**. Token dibuat sendiri oleh pemilik melalui pengaturan GitHub, lalu dimasukkan pada halaman login admin. Jangan menaruh token pada source, `data.json`, localStorage, atau chat. Token hanya disimpan dalam memori tab dan hilang saat halaman dimuat ulang. Login memeriksa akses menulis pemilik terhadap repositori; GitHub memverifikasi izin setiap penyimpanan.

GitHub Pages tidak menyediakan server login. Tidak ada password admin bawaan atau pemeriksaan password yang bisa dibaca dari HTML. Halaman formulir login publik; perubahan hanya dapat diterbitkan oleh akun GitHub yang berizin.

## Data dan publikasi

Perubahan admin ditulis ke `data.json` pada branch `main`, menggunakan SHA file agar penyimpanan dari sesi lain tidak tertimpa. Upload foto/musik ditulis ke folder `uploads`. GitHub Pages menerbitkan ulang setelah commit; biasanya perlu 1–3 menit. Semua data, foto, audio, serta riwayat commit pada repositori ini bersifat publik. Rekening yang tidak diaktifkan dihapus dari konfigurasi terbaru saat menyimpan; riwayat commit sebelumnya tetap publik.

Tema, nama mempelai, acara, foto, musik, rekening, teks, dan pratinjau dapat diatur lewat admin. Nama tamu menggunakan parameter `?to=Nama%20Tamu`.

## Source

Source React/TypeScript berada dalam folder `source/`. File HTML, bundle, dan aset di root adalah hasil build. Untuk mengubah kode: salin isi `source/` ke checkout build terpisah, jalankan `npm install`, lalu `npm run build`. Untuk mempertahankan data terbaru, unduh `data.json` dari root repositori dan gunakan sebagai `public/data.json` sebelum build. Salin isi hasil `dist/` kembali ke root repositori. Jangan menimpa folder `uploads` saat pembaruan.

Data undangan dari repositori lain tidak digabung ke proyek ini.
