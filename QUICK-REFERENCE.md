# 🚀 QUICK REFERENCE - Upload ke GitHub & Deploy Vercel

## ✅ Files Yang HARUS Di-Upload ke GitHub

Upload **SEMUA** files kecuali yang di `.gitignore`:

```
✅ index.html
✅ apps.html
✅ admin.html
✅ home.css
✅ home.js
✅ manifest.json
✅ robots.txt
✅ vercel.json
✅ .gitignore
✅ README.md
✅ QUICK-START.md
✅ UPLOAD-GUIDE.md
✅ DEPLOYMENT.md
✅ ICON-APK-GUIDE.md
✅ CHANGELOG.md
✅ assets/ folder (dengan icons)
```

**JANGAN upload:**
```
❌ node_modules/
❌ .vscode/
❌ .DS_Store
❌ *.log files
```

---

## 📦 Git Commands (Copy & Paste)

```bash
# 1. Initialize Git (jika belum)
git init

# 2. Add semua files
git add .

# 3. Commit
git commit -m "Initial commit: Niconve Website"

# 4. Buat repository di GitHub, kemudian:
git remote add origin https://github.com/USERNAME/niconve-website.git

# 5. Push ke GitHub
git branch -M main
git push -u origin main
```

**DONE! ✅** Repository sekarang di GitHub

---

## 🌐 Deploy ke Vercel (Email Berbeda)

### Step-by-Step:

1. **Buka Vercel**
   ```
   https://vercel.com
   ```

2. **Sign Up** dengan email berbeda
   - Bisa pakai: Google / GitHub / GitLab / Email

3. **Import Project**
   - Click: **"Add New" → "Project"**
   - Pilih: **"Import Git Repository"**
   - Connect: GitHub account kamu
   - Select: **niconve-website** repository

4. **Configure**
   - Framework: **Other** (atau biarkan default)
   - Build Command: **(kosong)**
   - Output Directory: **(kosong)**
   - Install Command: **(kosong)**

5. **Deploy**
   - Click: **"Deploy"**
   - Tunggu 30-60 detik
   - **DONE!** Website live di: `https://niconve-website.vercel.app`

---

## 🎨 Upload Icon Aplikasi (3 Cara)

### **Cara 1: Upload ke Folder `assets/icons/`** (RECOMMENDED)

```bash
# 1. Copy icon kamu ke folder ini:
niconve-website/assets/icons/delinox.png

# 2. Commit & push
git add assets/icons/
git commit -m "Add Delinox icon"
git push
```

**Update HTML:** Edit `apps.html` line ~115
```html
<!-- Ganti SVG dengan: -->
<img src="assets/icons/delinox.png" 
     alt="Delinox" 
     style="width: 120px; height: 120px; border-radius: 20px; object-fit: cover;">
```

Edit juga `index.html` line ~266 (sama seperti di atas, tapi width/height 150px)

---

### **Cara 2: Upload ke Image Hosting**

Upload icon ke:
- **Imgur**: https://imgur.com (Gratis unlimited)
- **Postimages**: https://postimages.org (Gratis)

Kemudian gunakan URL:
```html
<img src="https://i.imgur.com/YOUR-IMAGE-ID.png" 
     alt="Delinox" 
     style="width: 120px; height: 120px; border-radius: 20px;">
```

---

### **Cara 3: Via GitHub Web Interface**

1. Buka repo di GitHub
2. Navigate: `assets/icons/`
3. Click: **"Add file" → "Upload files"**
4. Drag & drop icon kamu
5. Commit changes
6. Vercel auto-deploy!

---

## 📱 Upload APK File (2 Cara)

### **Cara 1: GitHub Releases** (RECOMMENDED - Gratis Unlimited)

```bash
# 1. Di GitHub repo, click "Releases"
# 2. "Create a new release"
# 3. Tag: v1.0.0
# 4. Title: Delinox v1.0.0
# 5. Upload APK file
# 6. Publish release
```

**Copy download URL:**
```
https://github.com/USERNAME/niconve-website/releases/download/v1.0.0/delinox.apk
```

**Update `home.js`:** Tambahkan function
```javascript
function initiateDownload(appName) {
    const urls = {
        'delinox': 'https://github.com/USERNAME/niconve-website/releases/download/v1.0.0/delinox.apk'
    };
    
    if (urls[appName]) {
        window.location.href = urls[appName];
    } else {
        alert('APK belum tersedia');
    }
}
```

---

### **Cara 2: Via Admin Panel** (LocalStorage - Development Only)

1. Buka: `https://your-site.vercel.app/admin.html`
2. Login dengan password: `niconve2025`
3. Upload APK (max 100MB)
4. **NOTE**: Hanya tersimpan di browser kamu!

---

## ⚙️ Update Password Admin

**PENTING!** Ganti password sebelum deploy:

Edit `admin.html` line **~234**:
```javascript
const ADMIN_PASSWORD = 'YOUR-STRONG-PASSWORD-HERE';
```

Example password yang kuat:
```
N1c0nv3@2025!Secure
MyStr0ng#P@ssW0rd
```

---

## 🔄 Update Website (After Deploy)

```bash
# 1. Edit files (index.html, apps.html, etc)
# 2. Commit & push
git add .
git commit -m "Update: description"
git push

# Vercel akan OTOMATIS re-deploy! (30-60 detik)
```

---

## ✅ Final Checklist

### Before First Deploy:
- [ ] Semua files sudah di commit ke GitHub
- [ ] Password admin sudah diganti
- [ ] Icon aplikasi sudah di-upload ke `assets/icons/`
- [ ] Vercel account sudah dibuat (email berbeda)
- [ ] Repository connected ke Vercel

### After Deploy:
- [ ] Website accessible via Vercel URL
- [ ] Test navigation (Home → Apps → Admin)
- [ ] Test responsive (mobile & desktop)
- [ ] Upload icon via folder atau hosting
- [ ] Update HTML dengan icon path
- [ ] Upload APK via GitHub Releases
- [ ] Update download URLs di `home.js`
- [ ] Test download functionality

---

## 📚 Dokumentasi Lengkap

- **DEPLOYMENT.md**: Guide lengkap deployment
- **ICON-APK-GUIDE.md**: Panduan upload icon & APK detail
- **UPLOAD-GUIDE.md**: Upload system documentation
- **QUICK-START.md**: Quick start 5 menit

---

## 🆘 Need Help?

**Icon tidak muncul?**
- Check: `assets/icons/delinox.png` exists
- Check: HTML path correct
- Check: Clear cache & refresh

**APK tidak bisa download?**
- Check: GitHub Release URL correct
- Check: Function `initiateDownload()` updated
- Check: Browser console untuk errors

**Deploy gagal?**
- Check: `.gitignore` tidak block files penting
- Check: Vercel build logs
- Check: Semua files ter-push ke GitHub

---

**Last Updated**: November 29, 2025  
**Version**: 1.2.0

---

## 🎯 TL;DR (Too Long Didn't Read)

```bash
# 1. Upload to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# 2. Deploy to Vercel
# - Sign up Vercel dengan email berbeda
# - Import GitHub repo
# - Click Deploy
# - DONE! ✅

# 3. Upload Icon
# - Copy ke assets/icons/delinox.png
# - Update HTML: <img src="assets/icons/delinox.png">
# - Commit & push

# 4. Upload APK
# - GitHub Releases → Upload APK
# - Copy download URL
# - Update home.js dengan URL
# - Commit & push
```

**That's it!** 🚀
