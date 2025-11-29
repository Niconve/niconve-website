# 📸 Panduan Upload Icon & APK untuk Aplikasi

## 🎨 Upload Icon Aplikasi

### Option 1: Simpan Icon di Folder `assets/icons/`

#### Step 1: Buat Folder Structure
```
niconve-website/
├── assets/
│   └── icons/
│       ├── delinox.png          ← Icon Delinox kamu
│       ├── quiet-travails.png   ← Icon Quiet Travails
│       ├── top-rated.png        ← Icon Top Rated
│       └── beechfront.png       ← Icon Beechfront
├── index.html
├── apps.html
└── ...
```

#### Step 2: Upload Icons ke Folder
1. Buat folder `assets/icons/` di root project
2. Copy icon files ke folder tersebut
3. Format: PNG/JPG/SVG (Recommended: **PNG dengan transparansi**)
4. Size: **512x512px** atau **1024x1024px**

#### Step 3: Update HTML untuk Gunakan Icon
Edit `apps.html` line ~115:

**Sebelum:**
```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width: 120px; height: 120px;">
    <!-- SVG paths... -->
</svg>
```

**Sesudah:**
```html
<img src="assets/icons/delinox.png" 
     alt="Delinox" 
     style="width: 120px; height: 120px; border-radius: 20px; object-fit: cover;">
```

Edit juga di `index.html` di section Quick Preview (~266):
```html
<img src="assets/icons/delinox.png" 
     alt="Delinox" 
     style="width: 150px; height: 150px; border-radius: 20px; object-fit: cover;">
```

---

### Option 2: Upload Icon via URL (Image Hosting)

#### Recommended Services:
- **Imgur** (Free, unlimited): https://imgur.com
- **Cloudinary** (Free 25GB): https://cloudinary.com
- **ImageKit** (Free 20GB): https://imagekit.io
- **Postimages** (Free): https://postimages.org

#### Steps:
1. Upload icon kamu ke image hosting
2. Copy direct image URL
3. Gunakan URL di HTML:

```html
<img src="https://i.imgur.com/YOUR-IMAGE-ID.png" 
     alt="Delinox" 
     style="width: 120px; height: 120px; border-radius: 20px;">
```

**Contoh URL:**
```
Imgur: https://i.imgur.com/abc123.png
Cloudinary: https://res.cloudinary.com/user/image/upload/icon.png
```

---

### Option 3: Convert ke Base64 (Tidak Recommended untuk Production)

Jika file kecil (<50KB), bisa convert ke Base64:

1. **Online Tool**: https://base64.guru/converter/encode/image
2. Upload icon → Generate Base64
3. Copy result dan paste ke HTML:

```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." 
     alt="Delinox">
```

**⚠️ Warning:** Base64 membuat HTML file besar, hindari untuk icon > 50KB

---

## 📱 Upload APK File

### Cara 1: Via Admin Panel (LocalStorage)

**Current system** menggunakan localStorage browser.

#### Steps:
1. **Login Admin Panel**
   ```
   https://your-site.vercel.app/admin.html
   ```

2. **Select App Name**
   - Pilih: "Delinox"

3. **Upload APK**
   - Click area upload atau drag & drop file `.apk`
   - Max size: **100MB**
   - Tunggu proses upload selesai

4. **Verify**
   - APK tersimpan di browser localStorage
   - Buka `apps.html` → Test download button

#### ⚠️ Limitations:
- Storage: ~5-10MB (tergantung browser)
- Tidak persistent (hilang jika clear data)
- Hanya untuk **development/testing**

---

### Cara 2: Cloud Storage (Production Recommended)

Untuk production dengan banyak user, gunakan cloud storage:

#### Option A: Vercel Blob Storage (Recommended)

**Setup:**
```bash
# Install
npm install @vercel/blob

# Deploy ke Vercel
vercel
```

**Config dalam project:**
```javascript
// upload-handler.js
import { put } from '@vercel/blob';

async function uploadAPK(file) {
  const blob = await put(file.name, file, {
    access: 'public',
  });
  return blob.url; // URL untuk download
}
```

**Pricing:**
- Free: 500MB
- Pro: $20/bulan → 100GB

---

#### Option B: Cloudflare R2 (Free 10GB)

**Setup:**
```bash
npm install @aws-sdk/client-s3
```

**Config:**
```javascript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});
```

**Pricing:**
- Free: 10GB storage
- $0.015/GB setelahnya

---

#### Option C: Firebase Storage

**Setup:**
```bash
npm install firebase
```

**Config:**
```javascript
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();
const storageRef = ref(storage, `apks/${file.name}`);

// Upload
await uploadBytes(storageRef, file);

// Get URL
const downloadURL = await getDownloadURL(storageRef);
```

**Pricing:**
- Free: 5GB
- Spark Plan: Gratis
- Blaze Plan: Pay as you go

---

#### Option D: GitHub Releases (Gratis Unlimited)

Upload APK sebagai GitHub Release:

**Steps:**
1. Push project ke GitHub
2. Go to: **Releases** → **Create a new release**
3. Upload APK file as asset
4. Publish release
5. Copy download URL

**Download URL Format:**
```
https://github.com/USERNAME/REPO/releases/download/v1.0.0/delinox.apk
```

**Gunakan di HTML:**
```javascript
function initiateDownload(appName) {
  const downloadUrls = {
    'delinox': 'https://github.com/aldnprbs/niconve-website/releases/download/v1.0.0/delinox.apk',
    // ... more apps
  };
  
  window.location.href = downloadUrls[appName];
}
```

**Kelebihan:**
- ✅ Gratis unlimited storage
- ✅ CDN built-in (fast download)
- ✅ Versioning support
- ✅ Easy to update

**Kekurangan:**
- ❌ Manual upload via GitHub UI
- ❌ Public (semua orang bisa lihat)

---

## 🔧 Update Download Function

Setelah upload APK, update function di `home.js`:

### Untuk LocalStorage (Current):
```javascript
function initiateDownload(appName) {
    const apps = JSON.parse(localStorage.getItem('niconveApks') || '{}');
    const appData = apps[appName];
    
    if (appData) {
        // Download from localStorage
        const link = document.createElement('a');
        link.href = appData.data;
        link.download = appData.name;
        link.click();
    }
}
```

### Untuk Cloud Storage:
```javascript
function initiateDownload(appName) {
    const downloadUrls = {
        'delinox': 'https://your-storage.com/apks/delinox.apk',
        'quiet-travails': 'https://your-storage.com/apks/quiet-travails.apk',
    };
    
    if (downloadUrls[appName]) {
        window.location.href = downloadUrls[appName];
    }
}
```

### Untuk GitHub Releases:
```javascript
function initiateDownload(appName) {
    const githubReleases = {
        'delinox': 'https://github.com/aldnprbs/niconve-website/releases/download/v1.0.0/delinox.apk',
    };
    
    window.location.href = githubReleases[appName];
}
```

---

## 📋 Complete Workflow

### Development (LocalStorage):
1. ✅ Upload icon ke `assets/icons/`
2. ✅ Update HTML dengan `<img src="assets/icons/delinox.png">`
3. ✅ Upload APK via admin panel
4. ✅ Test download di browser

### Production (Cloud Storage):
1. ✅ Upload icon ke `assets/icons/` atau image hosting
2. ✅ Update HTML dengan icon path/URL
3. ✅ Setup cloud storage (Vercel Blob/R2/Firebase/GitHub)
4. ✅ Upload APK ke cloud
5. ✅ Update download URLs di `home.js`
6. ✅ Deploy ke Vercel
7. ✅ Test dari production URL

---

## 🎯 Recommended Approach untuk Production

### Best Practice:
```
Icons: assets/icons/ folder (di GitHub) → Fast loading, cached
APKs:  GitHub Releases → Free, fast CDN, versioning
```

### Workflow:
1. **Commit icons** ke folder `assets/icons/`
2. **Upload APK** ke GitHub Releases
3. **Update** `home.js` dengan GitHub Release URLs
4. **Push** ke GitHub
5. **Vercel** auto-deploy

---

## 📝 Checklist Upload Icon & APK

### Before Deploy:
- [ ] Icon tersedia (PNG 512x512px)
- [ ] Icon uploaded ke folder atau hosting
- [ ] HTML updated dengan icon path
- [ ] APK file ready (tested & signed)
- [ ] APK uploaded ke storage (GitHub/Cloud)
- [ ] Download URLs updated di `home.js`

### After Deploy:
- [ ] Icon muncul di website
- [ ] Download button works
- [ ] APK downloaded successfully
- [ ] APK bisa di-install di Android

---

## 🆘 Troubleshooting

### Icon Tidak Muncul
```
Problem: Icon tidak tampil
Solution:
1. Check path: assets/icons/delinox.png
2. Check file exists di folder
3. Check capitalization (case-sensitive)
4. Try full URL: /assets/icons/delinox.png
5. Clear browser cache
```

### APK Tidak Bisa Download
```
Problem: Download button tidak berfungsi
Solution:
1. Check localStorage ada data APK
2. Check download URLs correct
3. Check CORS settings (jika pakai hosting lain)
4. Check file size < limit
5. Try direct URL di browser
```

---

**Last Updated**: November 29, 2025
