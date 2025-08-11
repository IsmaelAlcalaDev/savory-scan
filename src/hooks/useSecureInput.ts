
import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface SecurityOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  maxLength?: number;
  stripScripts?: boolean;
}

const DEFAULT_OPTIONS: SecurityOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
  allowedAttributes: [],
  maxLength: 1000,
  stripScripts: true,
};

export const useSecureInput = (options: SecurityOptions = {}) => {
  const config = useMemo(() => ({
    ...DEFAULT_OPTIONS,
    ...options,
  }), [options]);

  // Sanitize HTML content
  const sanitizeHtml = (input: string): string => {
    if (!input) return '';
    
    const cleanHtml = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: config.allowedTags,
      ALLOWED_ATTR: config.allowedAttributes,
      FORBID_TAGS: config.stripScripts ? ['script'] : [],
    });
    
    return config.maxLength ? cleanHtml.substring(0, config.maxLength) : cleanHtml;
  };

  // Sanitize plain text (remove potential XSS)
  const sanitizeText = (input: string): string => {
    if (!input) return '';
    
    // Remove HTML tags and decode entities
    const textOnly = input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[#\w]+;/g, '') // Remove HTML entities
      .trim();
    
    return config.maxLength ? textOnly.substring(0, config.maxLength) : textOnly;
  };

  // Sanitize search queries
  const sanitizeSearchQuery = (query: string): string => {
    if (!query) return '';
    
    // Remove potential SQL injection patterns and XSS
    const cleanQuery = query
      .replace(/[<>'"]/g, '') // Remove dangerous characters
      .replace(/\b(union|select|insert|update|delete|drop|exec|script)\b/gi, '') // Remove SQL keywords
      .trim();
    
    return cleanQuery.substring(0, 100); // Limit search query length
  };

  // Validate and sanitize URL inputs
  const sanitizeUrl = (url: string): string | null => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      
      // Only allow HTTP and HTTPS protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return null;
      }
      
      return urlObj.toString();
    } catch {
      return null;
    }
  };

  // Rate limiting for inputs (to prevent spam)
  const createRateLimiter = (maxAttempts: number, windowMs: number) => {
    const attempts = new Map<string, number[]>();
    
    return (identifier: string): boolean => {
      const now = Date.now();
      const userAttempts = attempts.get(identifier) || [];
      
      // Remove old attempts outside the window
      const recentAttempts = userAttempts.filter(time => now - time < windowMs);
      
      if (recentAttempts.length >= maxAttempts) {
        return false; // Rate limit exceeded
      }
      
      recentAttempts.push(now);
      attempts.set(identifier, recentAttempts);
      
      return true; // Allow the request
    };
  };

  // Input validation helpers
  const validateInput = {
    email: (email: string): { isValid: boolean; message?: string } => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Invalid email format' };
      }
      return { isValid: true };
    },
    
    phone: (phone: string): { isValid: boolean; message?: string } => {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        return { isValid: false, message: 'Invalid phone number format' };
      }
      return { isValid: true };
    },
    
    name: (name: string): { isValid: boolean; message?: string } => {
      const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,50}$/;
      if (!nameRegex.test(name)) {
        return { isValid: false, message: 'Name must be 2-50 characters, letters only' };
      }
      return { isValid: true };
    },
  };

  return {
    sanitizeHtml,
    sanitizeText,
    sanitizeSearchQuery,
    sanitizeUrl,
    createRateLimiter,
    validateInput,
  };
};
