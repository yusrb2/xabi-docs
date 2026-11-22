# xabi docs

Dokumentasi web interaktif dan prosedural untuk [`xabi`](https://github.com/yusrb2/xabi) — local web dev orchestrator minimalis berbasis Go standard library di Linux dan Windows.

Proyek ini dibuat murni dengan HTML, CSS, dan Vanilla JavaScript tanpa *build step*, tanpa Node/NPM, dan langsung siap dijalankan secara lokal maupun melalui GitHub Pages.

## Fitur Dokumentasi

- **Global OS Switcher (`Windows PowerShell` / `Linux Bash/Zsh`):** Mengubah perintah instalasi, path XDG, socket/port PHP FastCGI, izin file `hosts`, dan shell completion secara instan (`localStorage`).
- **Panduan Prosedural 7 Langkah:** Alur berurutan dari build & instalasi hingga utilitas harian, lengkap dengan checklist `"Tandai Selesai"` dan progress bar di header.
- **Terminal Sandbox Interaktif:** Simulasi perintah `xabi` (`doctor`, `up`, `status`, `add`, `tls`, `php`, `ls`) dengan output realistis menyesuaikan OS aktif.
- **Pencarian Cepat (`Ctrl+K` / `/`) & Scrollspy:** Navigasi daftar isi otomatis, filter subcommand real-time, serta tombol satu-klik `Copy` di setiap blok kode.

## Struktur File

```text
xabi-docs/
├── index.html   # Halaman utama dokumentasi prosedural (7 langkah + cheat sheet)
├── style.css    # Desain dark clean developer docs yang responsif
├── app.js       # Logika OS switcher, checklist, terminal simulator, & search
├── README.md    # Panduan lokal & aktivasi GitHub Pages
└── LICENSE      # GNU General Public License v3.0
```

## Menjalankan Secara Lokal

Karena tidak ada tahap kompilasi atau bundler, kamu bisa preview dengan cara paling sederhana:

### 1. Langsung menggunakan `xabi` (Direkomendasikan)

Jika `xabi` sudah terpasang di mesin lokal:

```sh
cd xabi-docs
xabi up
xabi add xabi-docs
xabi open xabi-docs
```

Situs akan langsung aktif sebagai static vhost di `http://xabi-docs.test` (atau tambahkan `xabi tls xabi-docs` untuk HTTPS lokal).

### 2. Server HTTP Statis Sederhana

Atau jalankan server statis lokal sementara:

```sh
# Python 3
python -m http.server 8080

# Atau Go / PHP built-in server
php -S 127.0.0.1:8080
```

Lalu buka `http://localhost:8080` di browser.

## Aktivasi GitHub Pages

Setelah repositori di-push ke GitHub (`yusrb2/xabi-docs`):

1. Buka repositori di GitHub, lalu masuk ke tab **Settings**.
2. Pada sidebar kiri, pilih **Pages** (di bagian *Code and automation*).
3. Di bagian **Build and deployment**:
   - **Source:** pilih `Deploy from a branch`
   - **Branch:** pilih `main` dan folder `/ (root)`, lalu klik **Save**.
4. Tunggu 1–2 menit hingga GitHub Actions selesai mempublikasikan halaman. URL dokumentasi akan tersedia di:
   `https://yusrb2.github.io/xabi-docs/`

## Lisensi

Selaras dengan repositori utama `xabi`, proyek dokumentasi ini dilisensikan di bawah [GNU GPL-3.0](LICENSE).
