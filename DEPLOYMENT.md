# 📦 Deployment Guide - Vercel dengan Email Berbeda

## Files yang Harus Di-Upload ke GitHub

Upload **SEMUA files** kecuali yang ada di `.gitignore`:

### ✅ Files yang HARUS di-upload:
```
niconve-website/
├── index.html          ✅ (Landing page)
├── apps.html           ✅ (Applications page)
├── admin.html          ✅ (Admin panel)
├── home.css            ✅ (Main stylesheet)
├── home.js             ✅ (Main JavaScript)
├── manifest.json       ✅ (PWA manifest)
├── robots.txt          ✅ (SEO)
├── vercel.json         ✅ (Vercel config)
├── .gitignore          ✅ (Git config)
├── README.md           ✅ (Documentation)
├── QUICK-START.md      ✅ (Quick guide)
├── UPLOAD-GUIDE.md     ✅ (Upload guide)
├── CHANGELOG.md        ✅ (Version history)
└── DEPLOYMENT.md       ✅ (This file)
```

### ❌ Files yang TIDAK perlu di-upload:
```
- node_modules/         ❌ (Jika ada)
- .vscode/              ❌ (IDE settings)
- .DS_Store             ❌ (Mac OS file)
- *.log                 ❌ (Log files)
- .env                  ❌ (Environment variables)
```

---

## 🚀 Langkah Deploy ke Vercel dengan Email Berbeda

### Step 1: Push ke GitHub
```bash
# Di terminal/cmd di folder project:
git init
git add .
git commit -m "Initial commit: Niconve Website"

# Buat repository baru di GitHub
# Kemudian:
git remote add origin https://github.com/USERNAME/niconve-website.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy ke Vercel
1. Buka **https://vercel.com**
2. Sign up dengan **email yang berbeda** (bisa pakai Google, GitHub, atau email)
3. Click **"Add New Project"**
4. Import repository GitHub kamu (niconve-website)
5. Settings:
   - **Framework Preset**: Other
   - **Build Command**: (kosongkan)
   - **Output Directory**: (kosongkan)
   - **Install Command**: (kosongkan)
6. Click **"Deploy"**

### Step 3: Configure Domain (Optional)
1. Di Vercel dashboard → Settings → Domains
2. Add custom domain atau gunakan `*.vercel.app` gratis

---

## 🔐 Security Settings

### Update Password Admin
**PENTING!** Ganti password default sebelum deploy:

Edit `admin.html` line **~234**:
```javascript
// UBAH PASSWORD INI!
const ADMIN_PASSWORD = 'niconve2025'; // ← Ganti dengan password kamu
```

Gunakan password yang kuat:
- Minimal 12 karakter
- Kombinasi huruf besar, kecil, angka, dan simbol
- Contoh: `MyS3cur3P@ssw0rd!2025`

---

## 📱 Upload Icon/Logo Aplikasi

### Format Icon yang Didukung:
- **PNG** (Recommended) - Transparansi support
- **JPG/JPEG** - File lebih kecil
- **SVG** - Scalable, file kecil
- **WebP** - Modern format, file kecil

### Ukuran Rekomendasi:
- **Icon App**: 512x512px (optimal)
- **Icon App Minimum**: 256x256px
- **Icon App Maximum**: 1024x1024px
- **Max File Size**: 5MB

### Cara Upload Icon di Admin Panel:

1. **Login ke Admin Panel**
   - Buka: `https://your-site.vercel.app/admin.html`
   - Masukkan password admin

2. **Upload Icon**
   - Click area upload atau drag & drop icon file
   - Pilih file icon (PNG/JPG/SVG recommended)
   - Icon otomatis ter-encode ke Base64
   - Icon tersimpan di localStorage browser

3. **Upload APK**
   - Upload file APK aplikasi (max 100MB)
   - Isi nama aplikasi
   - Icon yang sudah di-upload akan otomatis terhubung

### Folder Structure untuk Icons (Optional):
Jika ingin menyimpan icon di folder terpisah:
```
niconve-website/
├── assets/
│   └── icons/
│       ├── delinox-icon.png      (Icon Delinox)
│       ├── quiet-travails.png    (Icon Quiet Travails)
│       └── top-rated.png         (Icon Top Rated)
└── ...
```

Kemudian reference di HTML:
```html
<img src="assets/icons/delinox-icon.png" alt="Delinox">
```

---

## 🔄 Update Icon untuk Delinox (Current App)

### Option 1: Via Admin Panel (Recommended)
1. Login admin panel
2. Upload icon baru untuk Delinox
3. Icon otomatis replace yang lama

### Option 2: Edit HTML Directly
Edit `apps.html` dan `index.html`, cari section Delinox:

```html
<!-- Ganti SVG ini dengan path ke icon kamu -->
<img src="assets/icons/delinox.png" 
     alt="Delinox" 
     style="width: 120px; height: 120px;">
```

### Option 3: Use Icon URL
Upload icon ke image hosting (Imgur, Cloudinary, dll):
```html
<img src="https://i.imgur.com/YOUR-IMAGE.png" 
     alt="Delinox">
```

---

## 📊 Storage Options

### Development (Current):
- **LocalStorage**: Data tersimpan di browser
- **Limit**: ~5-10MB per domain
- **Persistence**: Hilang jika clear browser data

### Production (Recommended):
Untuk production dengan banyak users, gunakan cloud storage:

#### Option 1: Vercel Blob (Recommended)
```bash
npm install @vercel/blob
```

#### Option 2: Cloudflare R2 (Free 10GB)
```bash
npm install @aws-sdk/client-s3
```

#### Option 3: Firebase Storage (Free 5GB)
```bash
npm install firebase
```

#### Option 4: Supabase Storage (Free 1GB)
```bash
npm install @supabase/supabase-js
```

---

## 🎨 Customization

### Update Brand Colors
Edit `home.css`:
```css
:root {
    --accent: #3b82f6;           /* Primary blue */
    --accent-hover: #2563eb;     /* Hover blue */
    --primary: #0f172a;          /* Dark text */
    --gradient-accent: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Update Logo
Edit `index.html` dan `apps.html`:
```html
<div class="logo">
    <i class="fas fa-cloud"></i> <!-- Ganti icon ini -->
    Niconve                      <!-- Ganti nama ini -->
</div>
```

---

## 🐛 Troubleshooting

### Icon Tidak Muncul?
- Check file size < 5MB
- Check format: PNG/JPG/SVG/WebP
- Check browser console untuk error
- Clear localStorage dan upload ulang

### APK Tidak Bisa Download?
- Check ukuran file < 100MB
- Check localStorage browser tidak penuh
- Coba browser lain (Chrome recommended)

### Admin Panel Tidak Bisa Login?
- Check password di `admin.html`
- Check JavaScript tidak di-block
- Check browser console untuk error

### Deploy Vercel Gagal?
- Check semua files sudah di-push ke GitHub
- Check `.gitignore` tidak block file penting
- Check `vercel.json` configuration
- Lihat build logs di Vercel dashboard

---

## 📝 Post-Deployment Checklist

- [ ] Website accessible via Vercel URL
- [ ] Password admin sudah diganti
- [ ] Upload icon Delinox via admin panel
- [ ] Upload APK Delinox
- [ ] Test download functionality
- [ ] Test responsive di mobile
- [ ] Check all navigation links work
- [ ] Setup custom domain (optional)
- [ ] Add to Google Search Console (optional)
- [ ] Setup analytics (optional)

---

## 🆘 Support

Jika ada masalah:
1. Check browser console (F12)
2. Check Vercel deployment logs
3. Check GitHub repository files
4. Refer to `QUICK-START.md` dan `UPLOAD-GUIDE.md`

---

## 📱 Quick Commands Reference

```bash
# Initialize Git
git init
git add .
git commit -m "message"

# Connect to GitHub
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# Update website
git add .
git commit -m "Update: description"
git push

# Vercel akan otomatis re-deploy setiap git push!
```

---

**Last Updated**: November 29, 2025  
**Version**: 1.2.0
