# Niconve Website

Website premium untuk aplikasi Android dengan desain modern dan responsif.

## ✨ Fitur

- **Fully Responsive** - Sempurna di semua perangkat (mobile, tablet, laptop)
- **Mobile-First Design** - Dioptimalkan untuk pengalaman mobile terbaik
- **Landscape Support** - Mendukung orientasi portrait dan landscape
- **Dark Mode** - Toggle tema gelap/terang dengan smooth transition
- **Smooth Animations** - Animasi yang halus dan profesional
- **Touch Optimized** - Interaksi touch yang responsif di perangkat mobile
- **Fast Loading** - Optimasi performa untuk loading cepat
- **Accessible** - Keyboard navigation dan screen reader friendly

## 📱 Breakpoints Responsif

- **Mobile Portrait**: < 576px
- **Mobile Landscape**: 576px - 768px (landscape)
- **Tablet Portrait**: 768px - 992px
- **Tablet Landscape**: 992px - 1200px
- **Desktop**: > 1200px

## 🚀 Teknologi

- HTML5 Semantic
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- Google Fonts (Inter)

## 🎨 Fitur UI/UX

### Desktop
- Glassmorphism header dengan blur effect
- Gradient backgrounds dan hover effects
- Smooth scrolling navigation
- Interactive floating elements
- Animated statistics counter

### Mobile
- Sidebar navigation dengan overlay
- Touch-optimized buttons dan cards
- Reduced animations untuk performa
- Optimized font sizes
- Full-width CTAs untuk kemudahan klik

### Tablet
- Hybrid layout antara mobile dan desktop
- Grid layout yang disesuaikan
- Navigation yang optimal

## 📦 File Structure

```
niconve-website/
├── index.html          # Main website with download
├── admin.html          # Admin panel untuk upload APK
├── home.css           # Responsive styles + modal
├── home.js            # Interactive + download functionality
├── vercel.json        # Vercel deployment config
├── README.md          # Main documentation
├── UPLOAD-GUIDE.md    # Upload & download guide
└── CHANGELOG.md       # Version history
```

## 🔧 Cara Menggunakan

1. **Clone atau download repository**
2. **Buka `index.html`** di browser modern
3. **Atau deploy ke hosting** seperti Vercel, Netlify, atau GitHub Pages

### Deploy ke Vercel

```bash
npm i -g vercel
vercel
```

## 📱 Upload & Download System

### Admin Panel (`admin.html`)
- 🔐 Password protection (default: `niconve2025`)
- 📤 Upload APK files (max 100MB)
- 🗑️ Delete uploaded files
- 📊 View file information
- 💾 Local storage (development mode)

### Download Features
- 🎯 Modal download interface
- 📊 File size & info display
- ⚡ One-click download
- 🎨 Beautiful UI/UX
- 📱 Mobile optimized

### How to Upload APK
1. Open `admin.html` in browser
2. Login dengan password: `niconve2025`
3. Pilih aplikasi (Delinox, dll)
4. Upload APK file
5. File langsung tersedia untuk download

**Baca lengkap**: [UPLOAD-GUIDE.md](UPLOAD-GUIDE.md)

## 🎯 Optimasi Mobile

### iOS
- Viewport height fix untuk Safari
- Font size 16px minimum untuk prevent zoom
- -webkit-appearance: none untuk form inputs
- Touch callout disabled untuk better UX

### Android
- Tap highlight color customization
- Hardware acceleration untuk animations
- Passive scroll listeners
- Optimized touch interactions
- APK download support

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## ⚡ Performance Features

- CSS containment untuk performa render
- Will-change untuk animasi smooth
- Intersection Observer untuk lazy loading
- RequestAnimationFrame untuk scroll optimization
- Reduced motion support

## 🎨 Customization

### Colors
Edit CSS variables di `:root` untuk mengubah color scheme:

```css
:root {
    --primary: #0f172a;
    --accent: #3b82f6;
    /* ... */
}
```

### Fonts
Ganti font di `home.css`:

```css
body {
    font-family: 'Your Font', sans-serif;
}
```

## 📝 Sections

1. **Hero** - Landing section dengan CTA
2. **Trusted By** - Logo partners
3. **Featured App** - Aplikasi unggulan
4. **All Applications** - Grid semua apps
5. **Categories** - Kategori aplikasi
6. **Enterprise** - Solusi enterprise
7. **Coming Soon** - Apps dalam development
8. **Contact** - Form kontak
9. **Footer** - Links dan newsletter

## 🐛 Bug Fixes Applied

✅ Mobile menu sidebar navigation
✅ Touch interactions optimized
✅ Form inputs prevent zoom on iOS
✅ Landscape orientation support
✅ Overflow issues fixed
✅ Button sizes optimized for touch
✅ Grid layouts responsive
✅ Typography scales properly
✅ Images and icons responsive
✅ Performance optimizations

## 📱 Testing Checklist

- [x] iPhone SE (375px)
- [x] iPhone 12/13 (390px)
- [x] iPhone Pro Max (428px)
- [x] Android phones (360px - 414px)
- [x] iPad (768px)
- [x] iPad Pro (1024px)
- [x] Laptop (1366px)
- [x] Desktop (1920px)
- [x] All orientations (portrait & landscape)

## 🔄 Updates

### Version 1.2 (Current)
- ✨ **Admin panel** untuk upload APK
- ✨ **Download system** dengan modal interface
- ✨ **Delinox sebagai featured app** (ready to download)
- ✨ **File management** di admin panel
- ✨ **Local storage** untuk development
- ✨ **Coming soon badges** untuk apps lainnya
- 📁 Upload APK via admin.html
- 🔐 Password protected admin panel
- 📥 One-click download untuk users

### Version 1.1
- ✨ Fully responsive untuk semua devices
- ✨ Mobile menu sidebar dengan overlay
- ✨ Touch optimizations
- ✨ Landscape support
- ✨ Performance improvements
- ✨ Bug fixes untuk mobile browsers

## 👨‍💻 Author

**Alden Prabaswara**

## 📄 License

© 2025 Niconve. All rights reserved.

---

**Note**: Website ini sepenuhnya responsif dan telah dioptimalkan untuk semua ukuran layar dan orientasi. Tested di berbagai devices dan browsers untuk memastikan pengalaman terbaik.
