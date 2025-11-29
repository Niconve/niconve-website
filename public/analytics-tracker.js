// ============================================
// Niconve Analytics Tracker
// Auto-track page visits for analytics
// ============================================

(function() {
    'use strict';

    // Configuration
    const config = {
        apiEndpoint: '/api/analytics/track',
        sessionKey: 'niconve_session_id',
        trackDuration: true
    };

    // Generate session ID if not exists
    function getSessionId() {
        let sessionId = sessionStorage.getItem(config.sessionKey);
        
        if (!sessionId) {
            sessionId = 'SESSION-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem(config.sessionKey, sessionId);
        }
        
        return sessionId;
    }

    // Get page info
    function getPageInfo() {
        return {
            page_url: window.location.href,
            page_title: document.title,
            referrer: document.referrer || null,
            session_id: getSessionId()
        };
    }

    // Track page visit
    async function trackPageVisit() {
        const pageInfo = getPageInfo();
        
        try {
            await fetch(config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(pageInfo)
            });
            
            console.log('[Analytics] Page visit tracked:', pageInfo.page_url);
        } catch (error) {
            console.error('[Analytics] Failed to track page visit:', error);
        }
    }

    // Track visit duration on page unload
    function trackDuration() {
        if (!config.trackDuration) return;
        
        const startTime = Date.now();
        
        window.addEventListener('beforeunload', async function() {
            const duration = Math.floor((Date.now() - startTime) / 1000); // in seconds
            const pageInfo = getPageInfo();
            pageInfo.visit_duration = duration;
            
            // Use sendBeacon for reliable tracking on unload
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(pageInfo)], {
                    type: 'application/json'
                });
                navigator.sendBeacon(config.apiEndpoint, blob);
            }
        });
    }

    // Initialize tracking
    function init() {
        // Track page visit on load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', trackPageVisit);
        } else {
            trackPageVisit();
        }
        
        // Track duration
        trackDuration();
    }

    // Start tracking
    init();

})();
