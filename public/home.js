// Loading Screen
window.addEventListener('load', function() {
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);
});

// Mobile Menu Toggle
const mobileMenu = document.querySelector('.mobile-menu');
const nav = document.querySelector('nav');
const body = document.body;

if (mobileMenu && nav) {
    mobileMenu.addEventListener('click', function() {
        nav.classList.toggle('show');
        this.querySelector('i').classList.toggle('fa-bars');
        this.querySelector('i').classList.toggle('fa-times');
        body.style.overflow = nav.classList.contains('show') ? 'hidden' : '';
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!nav.contains(e.target) && !mobileMenu.contains(e.target) && nav.classList.contains('show')) {
            nav.classList.remove('show');
            mobileMenu.querySelector('i').classList.remove('fa-times');
            mobileMenu.querySelector('i').classList.add('fa-bars');
            body.style.overflow = '';
        }
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const nav = document.querySelector('nav');
            const mobileMenuIcon = document.querySelector('.mobile-menu i');
            if (nav && nav.classList.contains('show')) {
                nav.classList.remove('show');
                if (mobileMenuIcon) {
                    mobileMenuIcon.classList.remove('fa-times');
                    mobileMenuIcon.classList.add('fa-bars');
                }
                document.body.style.overflow = '';
            }
        }
    });
});

// Scroll animation
const fadeElements = document.querySelectorAll('.fade-in');

const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
    });
}, { threshold: 0.1 });

fadeElements.forEach(element => {
    appearOnScroll.observe(element);
});

// Header background on scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    const backToTop = document.getElementById('backToTop');
    
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
        if (backToTop) backToTop.classList.add('visible');
    } else {
        header.classList.remove('scrolled');
        if (backToTop) backToTop.classList.remove('visible');
    }
});

// Back to Top functionality
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        const icon = this.querySelector('i');
        if (newTheme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Set initial icon
    const icon = themeToggle.querySelector('i');
    if (savedTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

// Animated Counter for Stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Fetch Real Stats from Database
async function fetchRealStats() {
    try {
        const response = await fetch('/api/apps');
        const data = await response.json();
        
        if (data.apps && Array.isArray(data.apps)) {
            const totalApps = data.apps.length;
            const totalDownloads = data.apps.reduce((sum, app) => sum + (app.download_count || 0), 0);
            
            // Update data-count attributes
            const appsElement = document.getElementById('totalApps');
            const downloadsElement = document.getElementById('totalDownloads');
            
            if (appsElement) appsElement.setAttribute('data-count', totalApps);
            if (downloadsElement) downloadsElement.setAttribute('data-count', totalDownloads);
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default values if fetch fails
        const appsElement = document.getElementById('totalApps');
        const downloadsElement = document.getElementById('totalDownloads');
        if (appsElement) appsElement.setAttribute('data-count', '0');
        if (downloadsElement) downloadsElement.setAttribute('data-count', '0');
    }
}

// Call fetchRealStats on page load
fetchRealStats();

// Initialize counters when they come into view
const statNumbers = document.querySelectorAll('.stat-number');
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            const target = parseFloat(element.getAttribute('data-count'));
            
            if (element.textContent === '0') {
                if (target % 1 === 0) {
                    animateCounter(element, target);
                } else {
                    // For decimal numbers
                    let start = 0;
                    const duration = 2000;
                    const increment = target / (duration / 16);
                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= target) {
                            element.textContent = target.toFixed(1);
                            clearInterval(timer);
                        } else {
                            element.textContent = start.toFixed(1);
                        }
                    }, 16);
                }
            }
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => {
    statObserver.observe(stat);
});

// Active Navigation Link
function setActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', setActiveNavLink);

// Form Handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Simple validation
        let isValid = true;
        const requiredFields = this.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = 'var(--error)';
                isValid = false;
            } else {
                field.style.borderColor = 'var(--border)';
            }
        });
        
        if (isValid) {
            // Show success message (in a real app, you would send this to a server)
            const submitBtn = this.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            submitBtn.style.background = 'var(--success)';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                this.reset();
            }, 3000);
        }
    });
}

// Newsletter Form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = this.querySelector('input');
        const button = this.querySelector('button');
        
        if (input.value.trim()) {
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.background = 'var(--success)';
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = '';
                input.value = '';
            }, 2000);
        }
    });
}

// Download Modal Functions
let currentDownloadApp = '';

function openDownloadModal(appKey, appName) {
    currentDownloadApp = appKey;
    document.getElementById('modalAppName').textContent = appName;
    document.getElementById('infoAppName').textContent = appName;
    
    // Get file info from localStorage
    const uploadedFiles = JSON.parse(localStorage.getItem('niconveApks') || '{}');
    const fileData = uploadedFiles[appKey];
    
    if (fileData) {
        const size = (fileData.size / (1024 * 1024)).toFixed(2);
        document.getElementById('infoFileSize').textContent = size + ' MB';
        document.getElementById('modalDownloadBtn').disabled = false;
        document.getElementById('downloadBtnText').textContent = 'Download APK';
    } else {
        document.getElementById('infoFileSize').textContent = 'Not Available';
        document.getElementById('modalDownloadBtn').disabled = true;
        document.getElementById('downloadBtnText').textContent = 'File Not Found';
    }
    
    document.getElementById('downloadModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeDownloadModal() {
    document.getElementById('downloadModal').classList.remove('show');
    document.body.style.overflow = '';
}

function initiateDownload() {
    const uploadedFiles = JSON.parse(localStorage.getItem('niconveApks') || '{}');
    const fileData = uploadedFiles[currentDownloadApp];
    
    if (!fileData) {
        alert('File tidak tersedia. Silakan hubungi admin.');
        return;
    }
    
    // Update button
    const btn = document.getElementById('modalDownloadBtn');
    const btnText = document.getElementById('downloadBtnText');
    const originalText = btnText.textContent;
    
    btn.disabled = true;
    btnText.textContent = 'Downloading...';
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span id="downloadBtnText">Downloading...</span>';
    
    // Start download
    setTimeout(() => {
        try {
            // Create download link
            const link = document.createElement('a');
            link.href = fileData.data;
            link.download = fileData.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Success feedback
            btn.innerHTML = '<i class="fas fa-check"></i> <span id="downloadBtnText">Downloaded!</span>';
            btn.style.background = 'var(--success)';
            
            setTimeout(() => {
                closeDownloadModal();
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-download"></i> <span id="downloadBtnText">' + originalText + '</span>';
                btn.style.background = '';
            }, 2000);
        } catch (error) {
            alert('Error downloading file. Please try again.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-download"></i> <span id="downloadBtnText">' + originalText + '</span>';
        }
    }, 1000);
}

// Close modal with ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('downloadModal').classList.contains('show')) {
        closeDownloadModal();
    }
});

// Close modal when clicking outside
document.getElementById('downloadModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeDownloadModal();
    }
});

// App Download Buttons
document.querySelectorAll('.btn-download').forEach(button => {
    button.addEventListener('click', function() {
        const appCard = this.closest('.app-card');
        const appName = appCard.querySelector('h3').textContent;
        const appKey = this.getAttribute('data-app') || appCard.getAttribute('data-app');
        
        if (appKey) {
            openDownloadModal(appKey, appName);
        } else {
            // Coming soon apps
            alert('Aplikasi ini masih dalam pengembangan. Stay tuned!');
        }
    });
});

// Notify Me Buttons
document.querySelectorAll('.btn-notify').forEach(button => {
    button.addEventListener('click', function() {
        const appName = this.closest('.coming-app').querySelector('h3').textContent;
        
        const originalHTML = this.innerHTML;
        this.innerHTML = '<i class="fas fa-bell"></i> Notifications On!';
        this.style.background = 'var(--success)';
        
        setTimeout(() => {
            this.innerHTML = originalHTML;
            this.style.background = '';
        }, 3000);
    });
});

// Enterprise Solution Buttons
document.querySelectorAll('.btn-enterprise').forEach(button => {
    button.addEventListener('click', function() {
        const solutionName = this.closest('.enterprise-card').querySelector('h3').textContent;
        
        // Show modal or redirect to contact form
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            window.scrollTo({
                top: contactSection.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Pre-fill the subject
            const subjectSelect = document.getElementById('subject');
            if (subjectSelect) {
                subjectSelect.value = 'enterprise';
            }
        }
    });
});

// Get Started Button
const getStartedBtn = document.getElementById('getStartedBtn');
if (getStartedBtn) {
    getStartedBtn.addEventListener('click', function() {
        const featuredSection = document.getElementById('featured');
        if (featuredSection) {
            window.scrollTo({
                top: featuredSection.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
}

// Floating Elements Animation Enhancement
function enhanceFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((element, index) => {
        // Add random delay for more natural movement
        const randomDelay = Math.random() * 2;
        element.style.animationDelay = `${randomDelay}s`;
        
        // Add hover effect
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2) rotate(10deg)';
            this.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.background = 'rgba(255, 255, 255, 0.1)';
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    enhanceFloatingElements();
    setActiveNavLink();
    
    // Add loading animation to app icons
    document.querySelectorAll('.app-image i').forEach(icon => {
        icon.style.animation = 'pulse 2s ease-in-out infinite';
    });
    
    // Improve touch interactions for mobile
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // Add touch feedback for buttons
        document.querySelectorAll('button, .btn-primary, .btn-secondary, .cta-button, .cta-button-secondary').forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = '';
                }, 100);
            });
        });
    }
    
    // Optimize scroll performance
    let ticking = false;
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', function() {
        lastScrollY = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(function() {
                setActiveNavLink();
                ticking = false;
            });
            
            ticking = true;
        }
    }, { passive: true });
    
    // Fix viewport height for mobile browsers
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
});

// Performance Optimization: Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const nav = document.querySelector('nav');
        const mobileMenuIcon = document.querySelector('.mobile-menu i');
        if (nav && nav.classList.contains('show')) {
            nav.classList.remove('show');
            if (mobileMenuIcon) {
                mobileMenuIcon.classList.remove('fa-times');
                mobileMenuIcon.classList.add('fa-bars');
            }
            document.body.style.overflow = '';
        }
    }
    
    // Tab key navigation enhancement
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// Add keyboard navigation styles
const style = document.createElement('style');
style.textContent = `
    .keyboard-navigation *:focus {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
    }
`;
document.head.appendChild(style);

// Error Handling
window.addEventListener('error', function(e) {
    console.error('Error occurred:', e.error);
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
