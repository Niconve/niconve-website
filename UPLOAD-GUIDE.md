# 📱 Panduan Upload & Download Aplikasi - Niconve

## 🎯 Overview

Website Niconve sekarang dilengkapi dengan sistem upload dan download aplikasi yang mudah digunakan. Anda dapat upload file APK melalui admin panel dan user dapat langsung download dari website.

---

## 🔐 Admin Panel

### Akses Admin Panel

1. Buka `admin.html` di browser atau klik link "Admin" di footer website
2. URL: `https://your-domain.com/admin.html`

### Login

- **Default Password**: `niconve2025`
- **Cara Ganti Password**: 
  - Buka file `admin.html`
  - Cari baris: `const ADMIN_PASSWORD = 'niconve2025';`
  - Ganti dengan password baru Anda

### Upload APK

1. **Login ke admin panel**
2. **Pilih aplikasi** dari dropdown:
   - Delinox
   - Quiet Travails
   - Top Rated
   - Beechfront
3. **Upload file APK**:
   - Klik area upload atau drag & drop file
   - Max size: 100MB
   - Format: .apk only
4. **Klik "Upload APK"**
5. File akan tersimpan dan langsung tersedia untuk download

### Kelola File

- **Lihat file**: Scroll ke bagian "File yang Tersedia"
- **Hapus file**: Klik tombol trash icon (🗑️)
- **Info file**: Nama, ukuran ditampilkan otomatis

---

## 💾 Sistem Storage

### Current Implementation (Development)

**Local Storage (Browser)**
- File disimpan di browser localStorage
- Base64 encoding
- Persistent sampai di-clear
- ✅ Cocok untuk: Development & testing
- ❌ Limitation: Max ~5-10MB per file

### Recommended Production Storage

#### Option 1: Vercel Blob Storage (Recommended)
```bash
npm install @vercel/blob
```

**Keuntungan:**
- Upload unlimited size
- CDN integration
- Secure & fast
- Easy integration dengan Vercel
- Free tier: 1GB storage

**Setup:**
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Setup Blob in dashboard
4. Update `admin.html` dengan API endpoint

#### Option 2: Cloudflare R2
- Cheap storage ($0.015/GB)
- No egress fees
- S3 compatible

#### Option 3: Google Cloud Storage
- Free tier: 5GB
- Global CDN
- High reliability

#### Option 4: Firebase Storage
- Easy integration
- Free tier: 5GB
- Realtime updates

---

## 🎨 Fitur Website

### Delinox (Featured App)

**Status**: ✅ Ready to Download

**Features:**
- Logo graduation cap (education theme)
- Free download
- Progress tracking
- Interactive learning

**Download Process:**
1. User klik "Download APK"
2. Modal terbuka dengan info aplikasi
3. User klik download
4. APK otomatis terdownload

### Aplikasi Lainnya

**Status**: 🔜 Coming Soon

- Quiet Travails
- Top Rated
- Beechfront

Semua marked dengan badge "Coming Soon" dan disabled untuk download.

---

## 📁 File Structure

```
niconve-website/
├── index.html          # Main website dengan download system
├── admin.html          # Admin panel untuk upload APK
├── home.css           # Styles (includes download modal)
├── home.js            # JavaScript (includes download logic)
├── apps/              # Folder untuk APK files (optional)
│   └── delinox.apk
├── vercel.json        # Vercel config
└── README.md          # Documentation
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

**Update `vercel.json`:**
```json
{
  "version": 2,
  "name": "niconve",
  "builds": [
    {
      "src": "**/*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/admin",
      "dest": "/admin.html"
    }
  ]
}
```

### Alternative: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

---

## 🔒 Security Tips

### Password Protection

1. **Ganti Default Password**
   ```javascript
   const ADMIN_PASSWORD = 'your-strong-password-here';
   ```

2. **Gunakan .htaccess** (Apache):
   ```apache
   <Files "admin.html">
       AuthType Basic
       AuthName "Admin Area"
       AuthUserFile /path/to/.htpasswd
       Require valid-user
   </Files>
   ```

3. **Vercel Password Protection**:
   - Add di `vercel.json`:
   ```json
   {
     "routes": [
       {
         "src": "/admin.html",
         "headers": {
           "x-vercel-password-protection": "enabled"
         }
       }
     ]
   }
   ```

### File Security

- Validate file type (APK only)
- Check file size (max 100MB)
- Scan for malware (production)
- Use HTTPS only

---

## 📊 Production Upgrade Path

### Phase 1: Current (Development)
✅ Local storage
✅ Browser-based
✅ No server needed

### Phase 2: Cloud Storage (Recommended)
- Setup Vercel Blob/R2
- API endpoints untuk upload
- Database untuk metadata
- CDN untuk fast delivery

### Phase 3: Advanced Features
- User authentication
- Download analytics
- Version management
- Auto-update notification
- Rating & review system

---

## 🔧 Troubleshooting

### File tidak ter-download

**Solution:**
1. Check localStorage: `localStorage.getItem('niconveApks')`
2. Clear browser cache
3. Re-upload file di admin panel
4. Check browser console untuk errors

### File terlalu besar

**Solution:**
1. Compress APK (zipalign, proguard)
2. Upload ke cloud storage
3. Update localStorage limit

### Admin panel tidak bisa login

**Solution:**
1. Check password: `niconve2025`
2. Clear browser cache
3. Check console errors
4. Verify JavaScript enabled

---

## 📱 User Instructions

### How to Download

1. **Buka website** Niconve
2. **Scroll ke** "Featured Application" atau "All Applications"
3. **Klik "Download APK"** pada Delinox
4. **Modal akan muncul** dengan info aplikasi
5. **Klik "Download APK"** untuk mulai download
6. **Install APK** di Android device

### Enable Unknown Sources (Android)

**Android 8.0+:**
1. Settings → Apps & notifications
2. Special app access
3. Install unknown apps
4. Select browser → Allow

**Android 7.x dan dibawah:**
1. Settings → Security
2. Enable "Unknown sources"

---

## 📈 Analytics & Monitoring

### Track Downloads

Add to `home.js`:
```javascript
function trackDownload(appName) {
    // Google Analytics
    gtag('event', 'download', {
        'app_name': appName,
        'file_type': 'apk'
    });
    
    // Or custom API
    fetch('/api/track', {
        method: 'POST',
        body: JSON.stringify({ app: appName, action: 'download' })
    });
}
```

---

## 🎯 Next Steps

### Immediate
- [x] Upload Delinox APK via admin panel
- [ ] Test download functionality
- [ ] Share website link

### Short Term
- [ ] Migrate to cloud storage (Vercel Blob)
- [ ] Add download counter
- [ ] Add user reviews
- [ ] Create APK update notification

### Long Term
- [ ] Build API backend
- [ ] Add user accounts
- [ ] Create app marketplace
- [ ] Add payment system (for paid apps)

---

## 💡 Tips & Best Practices

### APK Optimization
- Use ProGuard untuk code obfuscation
- Enable minification
- Remove unused resources
- Optimize images
- Use App Bundle (AAB) di Play Store

### SEO Optimization
- Add Open Graph tags untuk sharing
- Use structured data untuk app schema
- Optimize meta descriptions
- Fast loading time
- Mobile-first design

### User Experience
- Clear download instructions
- File size info before download
- Progress indicator
- Error handling
- Success confirmation

---

## 📞 Support

**Developer**: Alden Prabaswara

**Website**: https://niconve.com

**Issues**: Create issue di GitHub atau contact admin

---

## 📄 License

© 2025 Niconve. All rights reserved.

---

**Last Updated**: November 29, 2025
**Version**: 1.2.0
