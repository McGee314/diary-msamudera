# 🌊 Diary Samudera

**Diary Samudera** adalah sebuah aplikasi jurnal pribadi digital yang dirancang dengan estetika modern dan pengalaman pengguna yang tenang. Project ini dibuat sebagai tempat untuk mencatat pikiran, momen, dan refleksi hidup dengan sentuhan desain premium.

---

## ✨ Fitur Utama

- **📖 Diary Feed**: Tampilan entri diary yang indah dengan dukungan format **Markdown**.
- **📸 Upload Foto**: Menambahkan foto langsung dari galeri atau kamera tanpa perlu link eksternal.
- **🗓️ Navigasi Kalender**: Memudahkan mencari kenangan berdasarkan tanggal tertentu dengan mini-calendar yang intuitif.
- **🔐 Admin Dashboard**: Panel khusus untuk mengelola (Tambah, Edit, Hapus) entri secara lokal.
- **💅 Desain Premium**: Menggunakan estetika *Glassmorphism*, palet warna *Earth-Tone*, dan mikro-animasi halus untuk kenyamanan visual.
- **📱 Responsive Layout**: Pengalaman yang konsisten baik di perangkat mobile maupun desktop.

---

## 🛠️ Tech Stack

Aplikasi ini dibangun menggunakan teknologi modern untuk memastikan performa dan kemudahan pengembangan:

### **Frontend**
- **React 19**: Library UI utama untuk membangun antarmuka yang reaktif.
- **TypeScript**: Menjamin keamanan tipe data dan skalabilitas kode.
- **Tailwind CSS 4**: Kerangka kerja CSS modern untuk styling yang cepat dan konsisten.
- **Vite**: Build tool super cepat untuk pengalaman pengembangan yang optimal.

### **Backend & Database**
- **Firebase Firestore**: Database NoSQL real-time untuk penyimpanan entri diary.
- **Base64 Photo Storage**: Foto dikompresi dan disimpan langsung di Firestore untuk kemudahan akses tanpa konfigurasi storage tambahan.

### **Libraries & Utilities**
- **Lucide React**: Koleksi ikon yang bersih dan konsisten.
- **Date-fns**: Library manipulasi tanggal untuk fitur kalender dan format waktu.
- **React Markdown**: Merender teks Markdown menjadi elemen HTML yang indah.
- **Framer Motion**: Memberikan sentuhan animasi halus pada transisi UI.
- **Sonner**: Sistem notifikasi (toast) yang elegan.

---

## 🚀 Cara Menjalankan Project

### **Prasyarat**
- Node.js (v18 atau lebih baru)
- NPM atau PNPM

### **Langkah-langkah**

1. **Clone project dan masuk ke direktori:**
   ```bash
   cd diary-msamudera
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Pastikan file `firebase-applet-config.json` sudah terisi dengan kredensial Firebase yang valid.

4. **Jalankan aplikasi di mode pengembangan:**
   ```bash
   npm run dev
   ```

5. **Buka di browser:**
   Akses `http://localhost:3000`

---

## 📸 Tampilan Admin
Untuk mengakses fitur admin, buka halaman `/admin` dan login dengan kredensial lokal yang telah dikonfigurasi. Di sana Anda dapat mulai menulis cerita baru dan mengunggah foto kenangan Anda.

---

*Dibuat dengan ❤️ oleh Samudera.*
