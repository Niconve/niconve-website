// Rate limiting middleware for authentication endpoints
// Prevents brute force attacks by limiting attempts per IP

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5; // Max 5 attempts per minute per IP

// Store attempts in memory (for production, use Redis)
const attemptStore = new Map();

function cleanupOldAttempts() {
    const now = Date.now();
    for (const [key, data] of attemptStore.entries()) {
        if (now - data.firstAttempt > RATE_LIMIT_WINDOW) {
            attemptStore.delete(key);
        }
    }
}

// Cleanup every 2 minutes
setInterval(cleanupOldAttempts, 2 * 60 * 1000);

function rateLimit(req, res, identifier) {
    // Get client IP (supports proxy headers)
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
               req.headers['x-real-ip'] ||
               req.connection?.remoteAddress ||
               'unknown';
    
    // Create unique key (IP + identifier for endpoint-specific limiting)
    const key = `${ip}:${identifier}`;
    const now = Date.now();
    
    // Get or create attempt record
    let attempts = attemptStore.get(key);
    
    if (!attempts) {
        // First attempt
        attemptStore.set(key, {
            count: 1,
            firstAttempt: now
        });
        return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
    }
    
    // Check if window has expired
    if (now - attempts.firstAttempt > RATE_LIMIT_WINDOW) {
        // Reset window
        attemptStore.set(key, {
            count: 1,
            firstAttempt: now
        });
        return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
    }
    
    // Increment attempt count
    attempts.count++;
    
    // Check if limit exceeded
    if (attempts.count > MAX_ATTEMPTS) {
        const timeLeft = Math.ceil((RATE_LIMIT_WINDOW - (now - attempts.firstAttempt)) / 1000);
        return {
            allowed: false,
            remaining: 0,
            retryAfter: timeLeft
        };
    }
    
    return {
        allowed: true,
        remaining: MAX_ATTEMPTS - attempts.count
    };
}

// Wrapper function for API routes
function withRateLimit(handler, identifier = 'default') {
    return async (req, res) => {
        const result = rateLimit(req, res, identifier);
        
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', MAX_ATTEMPTS);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        
        if (!result.allowed) {
            res.setHeader('Retry-After', result.retryAfter);
            res.status(429).json({
                error: 'Too many requests',
                message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
                retryAfter: result.retryAfter
            });
            return;
        }
        
        // Call the actual handler
        return handler(req, res);
    };
}

module.exports = { rateLimit, withRateLimit };
