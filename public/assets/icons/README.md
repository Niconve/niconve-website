# Assets Icons Folder

Folder ini untuk menyimpan icon/logo aplikasi.

## Format Icon yang Didukung:
- **PNG** (Recommended) - Transparansi support
- **JPG/JPEG** - File lebih kecil
- **SVG** - Scalable, file kecil
- **WebP** - Modern format

## Ukuran Rekomendasi:
- 512x512px (optimal)
- 1024x1024px (high quality)
- Minimum: 256x256px

## Naming Convention:
```
delinox.png
quiet-travails.png
top-rated.png
beechfront.png
```

## Cara Upload Icon:

### Option 1: Copy ke Folder Ini
1. Copy file icon kamu ke folder `assets/icons/`
2. Rename sesuai nama aplikasi
3. Update HTML reference

### Option 2: GitHub
1. Commit folder ini ke GitHub
2. Upload icons via GitHub web interface
3. Push changes

### Option 3: Git Command
```bash
# Copy icon ke folder ini
cp /path/to/your-icon.png assets/icons/delinox.png

# Git add & commit
git add assets/icons/
git commit -m "Add app icons"
git push
```

## Update HTML Reference:

### apps.html (line ~115):
```html
<img src="assets/icons/delinox.png" 
     alt="Delinox" 
     style="width: 120px; height: 120px; border-radius: 20px;">
```

### index.html (line ~266):
```html
<img src="assets/icons/delinox.png" 
     alt="Delinox" 
     style="width: 150px; height: 150px; border-radius: 20px;">
```

## Placeholder Icons

Jika belum ada icon, gunakan placeholder:
- https://via.placeholder.com/512x512/667eea/ffffff?text=App
- https://ui-avatars.com/api/?name=Delinox&size=512

Example:
```html
<img src="https://ui-avatars.com/api/?name=Delinox&size=512&background=667eea&color=fff" 
     alt="Delinox">
```
