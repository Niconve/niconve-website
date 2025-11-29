// XSS Protection and Input Sanitization Utilities
// Prevents cross-site scripting attacks by sanitizing user inputs

/**
 * Escape HTML characters to prevent XSS
 * @param {string} str - Input string
 * @returns {string} - Sanitized string
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    
    const htmlMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    };
    
    return str.replace(/[&<>"'\/]/g, (char) => htmlMap[char]);
}

/**
 * Sanitize user input (name, email, etc.)
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    // Remove dangerous characters
    let sanitized = input.trim();
    
    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Remove script tags
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
    
    // Remove javascript: protocols
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove data: protocols (except safe images)
    sanitized = sanitized.replace(/data:(?!image\/(png|jpg|jpeg|gif|webp))/gi, '');
    
    return sanitized;
}

/**
 * Validate and sanitize email
 * @param {string} email - Email input
 * @returns {string|null} - Sanitized email or null if invalid
 */
function sanitizeEmail(email) {
    if (typeof email !== 'string') return null;
    
    const sanitized = email.toLowerCase().trim();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
        return null;
    }
    
    // Check for dangerous characters
    if (/[<>'"\/\\]/.test(sanitized)) {
        return null;
    }
    
    return sanitized;
}

/**
 * Sanitize name (allow letters, spaces, hyphens, apostrophes)
 * @param {string} name - Name input
 * @returns {string} - Sanitized name
 */
function sanitizeName(name) {
    if (typeof name !== 'string') return '';
    
    let sanitized = name.trim();
    
    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Only allow letters, spaces, hyphens, apostrophes, and basic accents
    sanitized = sanitized.replace(/[^a-zA-Z\s\-'À-ÿ]/g, '');
    
    // Remove multiple spaces
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Limit length
    if (sanitized.length > 100) {
        sanitized = sanitized.substring(0, 100);
    }
    
    return sanitized;
}

/**
 * Sanitize description/text content
 * @param {string} text - Text input
 * @param {number} maxLength - Maximum length
 * @returns {string} - Sanitized text
 */
function sanitizeText(text, maxLength = 1000) {
    if (typeof text !== 'string') return '';
    
    let sanitized = text.trim();
    
    // Remove HTML tags (keep basic formatting if needed)
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove javascript: and data: protocols
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/data:/gi, '');
    
    // Limit length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized;
}

/**
 * Sanitize URL
 * @param {string} url - URL input
 * @returns {string|null} - Sanitized URL or null if invalid
 */
function sanitizeUrl(url) {
    if (typeof url !== 'string') return null;
    
    const trimmed = url.trim();
    
    // Only allow http/https protocols
    if (!/^https?:\/\//i.test(trimmed)) {
        return null;
    }
    
    // Check for dangerous patterns
    if (/javascript:/gi.test(trimmed) || /data:/gi.test(trimmed)) {
        return null;
    }
    
    try {
        const parsed = new URL(trimmed);
        return parsed.href;
    } catch {
        return null;
    }
}

/**
 * Sanitize SQL input (prevent SQL injection)
 * Note: Use parameterized queries instead when possible
 * @param {string} input - SQL input
 * @returns {string} - Sanitized input
 */
function sanitizeSql(input) {
    if (typeof input !== 'string') return '';
    
    // Remove common SQL injection patterns
    let sanitized = input.trim();
    
    // Remove SQL comments
    sanitized = sanitized.replace(/--/g, '');
    sanitized = sanitized.replace(/\/\*/g, '');
    sanitized = sanitized.replace(/\*\//g, '');
    
    // Remove dangerous SQL keywords (basic protection)
    const dangerousPatterns = [
        /\bDROP\b/gi,
        /\bDELETE\b/gi,
        /\bTRUNCATE\b/gi,
        /\bEXEC\b/gi,
        /\bEXECUTE\b/gi,
        /\bUNION\b/gi,
        /\bINSERT\b/gi,
        /\bUPDATE\b/gi
    ];
    
    dangerousPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
    });
    
    // Escape single quotes
    sanitized = sanitized.replace(/'/g, "''");
    
    return sanitized;
}

/**
 * Validate and sanitize object with multiple fields
 * @param {Object} data - Input data object
 * @param {Object} schema - Schema with field types
 * @returns {Object} - Sanitized data
 */
function sanitizeObject(data, schema) {
    const sanitized = {};
    
    for (const [key, type] of Object.entries(schema)) {
        const value = data[key];
        
        switch (type) {
            case 'email':
                sanitized[key] = sanitizeEmail(value);
                break;
            case 'name':
                sanitized[key] = sanitizeName(value);
                break;
            case 'text':
                sanitized[key] = sanitizeText(value);
                break;
            case 'url':
                sanitized[key] = sanitizeUrl(value);
                break;
            case 'html':
                sanitized[key] = escapeHtml(value);
                break;
            default:
                sanitized[key] = sanitizeInput(value);
        }
    }
    
    return sanitized;
}

module.exports = {
    escapeHtml,
    sanitizeInput,
    sanitizeEmail,
    sanitizeName,
    sanitizeText,
    sanitizeUrl,
    sanitizeSql,
    sanitizeObject
};
