// ============================================
// Authentication Navigation Handler
// Auto-update navbar based on login status
// ============================================

(function() {
    'use strict';

    // Check if user is authenticated
    async function checkAuth() {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.authenticated) {
                    updateNavForAuth(data.user);
                    return data.user;
                }
            }
            
            updateNavForGuest();
            return null;
        } catch (error) {
            console.error('[Auth] Check failed:', error);
            updateNavForGuest();
            return null;
        }
    }

    // Update navbar for authenticated user
    function updateNavForAuth(user) {
        const nav = document.querySelector('header nav ul');
        if (!nav) return;

        // Find or create auth section
        let authSection = nav.querySelector('.auth-section');
        
        if (!authSection) {
            authSection = document.createElement('li');
            authSection.className = 'auth-section';
            authSection.style.listStyle = 'none';
            nav.appendChild(authSection);
        }

        authSection.innerHTML = `
            <div class="user-menu">
                <button class="user-btn" id="userMenuBtn">
                    <i class="fas fa-user-circle"></i>
                    <span>${user.name}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-dropdown" id="userDropdown">
                    <a href="dashboard.html">
                        <i class="fas fa-th-large"></i> Dashboard
                    </a>
                    ${user.is_admin ? '<a href="admin-v2.html"><i class="fas fa-cog"></i> Admin Panel</a>' : ''}
                    <a href="#" id="navLogout">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
        `;

        // Add dropdown toggle
        const userBtn = document.getElementById('userMenuBtn');
        const dropdown = document.getElementById('userDropdown');
        
        if (userBtn && dropdown) {
            userBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function() {
                dropdown.classList.remove('show');
            });
        }

        // Logout handler
        const logoutBtn = document.getElementById('navLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                try {
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });
                    window.location.reload();
                } catch (error) {
                    console.error('[Auth] Logout failed:', error);
                    window.location.reload();
                }
            });
        }

        // Add CSS if not exists
        if (!document.getElementById('auth-nav-styles')) {
            const style = document.createElement('style');
            style.id = 'auth-nav-styles';
            style.textContent = `
                .auth-section { position: relative; }
                .user-menu { position: relative; }
                .user-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                .user-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .user-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 10px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    min-width: 200px;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.3s;
                    z-index: 1000;
                }
                .user-dropdown.show {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                .user-dropdown a {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 20px;
                    color: #333;
                    text-decoration: none;
                    transition: all 0.3s;
                    border-bottom: 1px solid #f0f0f0;
                }
                .user-dropdown a:last-child {
                    border-bottom: none;
                }
                .user-dropdown a:hover {
                    background: #f8f9ff;
                    color: #667eea;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Update navbar for guest
    function updateNavForGuest() {
        const nav = document.querySelector('header nav ul');
        if (!nav) return;

        let authSection = nav.querySelector('.auth-section');
        
        if (!authSection) {
            authSection = document.createElement('li');
            authSection.className = 'auth-section';
            authSection.style.listStyle = 'none';
            nav.appendChild(authSection);
        }

        // Only update if content is different (avoid unnecessary re-render)
        const guestHTML = `
            <div class="guest-actions">
                <a href="login.html" class="btn-login">
                    <i class="fas fa-sign-in-alt"></i> Login
                </a>
                <a href="register.html" class="btn-register">
                    <i class="fas fa-user-plus"></i> Daftar
                </a>
            </div>
        `;
        
        if (authSection.innerHTML.trim() !== guestHTML.trim()) {
            authSection.innerHTML = guestHTML;
        }
        
        // CSS is now in home.css, no need to inject styles
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAuth);
    } else {
        checkAuth();
    }

})();
