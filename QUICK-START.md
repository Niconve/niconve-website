# 🚀 Quick Start Guide - Niconve Upload System

## ⚡ 5-Menit Setup

### Step 1: Upload APK Delinox Anda

1. **Buka Admin Panel**
   ```
   File: admin.html
   ```
   Atau klik link "Admin" di footer website

2. **Login**
   ```
   Password: niconve2025
   ```

3. **Upload File**
   - Pilih "Delinox" dari dropdown
   - Klik area upload atau drag & drop APK file
   - Klik "Upload APK"
   - ✅ Done!

### Step 2: Test Download

1. **Buka** `index.html`
2. **Scroll** ke Featured Application (Delinox)
3. **Klik** "Download APK"
4. **Modal terbuka** → Klik "Download APK" lagi
5. **APK downloaded!** ✅

### Step 3: Deploy (Optional)

#### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

#### Netlify
```bash
npm i -g netlify-cli
netlify deploy
```

#### GitHub Pages
1. Push ke GitHub
2. Settings → Pages
3. Deploy from main branch

---

## 🔐 Ganti Password Admin

**File**: `admin.html`

Cari baris ke-234:
```javascript
const ADMIN_PASSWORD = 'niconve2025'; // Ganti dengan password Anda
```

Ganti jadi:
```javascript
const ADMIN_PASSWORD = 'password-baru-super-rahasia';
```

Save & refresh!

---

## 📂 Folder Structure

```
niconve-website/
│
├── 🌐 index.html          ← User mengunjungi ini
├── 🔐 admin.html          ← Anda upload APK di sini
├── 🎨 home.css            ← Styles
├── ⚡ home.js             ← Download logic
│
└── 📚 Dokumentasi
    ├── README.md          ← Overview
    ├── UPLOAD-GUIDE.md    ← Detailed guide
    └── CHANGELOG.md       ← Version history
```

---

## 💡 Tips Cepat

### Untuk Anda (Admin)
- 📤 Upload via `admin.html`
- 🗑️ Delete files yang lama
- 🔒 Jaga password tetap aman
- 📊 Check file size sebelum upload

### Untuk User
- 📥 Download via `index.html`
- 📱 Enable "Unknown Sources" di Android
- ✅ Check file size info
- 🆘 Contact admin jika error

---

## ⚠️ Troubleshooting

### "File Not Found" saat download
**Solution**: Upload ulang APK di admin panel

### Upload gagal
**Solution**: 
- Check file size (max 100MB)
- Check format (.apk only)
- Clear browser cache

### Lupa password admin
**Solution**: Edit `admin.html` line 234

---

## 🎯 Next Actions

- [ ] Upload Delinox APK
- [ ] Test download
- [ ] Ganti password admin
- [ ] Deploy to Vercel/Netlify
- [ ] Share website link

---

## 📞 Need Help?

**Documentation**:
- Quick Start: `QUICK-START.md` (ini)
- Full Guide: `UPLOAD-GUIDE.md`
- FAQ: `README.md`

**Contact**: Alden Prabaswara

---

**Version**: 1.2.0  
**Last Updated**: November 29, 2025
