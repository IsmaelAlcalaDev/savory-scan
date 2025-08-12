
import { useState } from 'react';
import DOMPurify from 'dompurify';
import { useSecurityLogger } from './useSecurityLogger';

interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
}

export const useSecurityValidation = () => {
  const { logSecurityEvent } = useSecurityLogger();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateAndSanitizeInput = (
    input: string,
    type: 'text' | 'email' | 'url' | 'html' | 'search' = 'text',
    maxLength: number = 1000
  ): ValidationResult => {
    const errors: string[] = [];
    let sanitizedValue = input;

    // Check for potential XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ];

    const hasXssAttempt = xssPatterns.some(pattern => pattern.test(input));
    
    if (hasXssAttempt) {
      errors.push('Potentially malicious content detected');
      logSecurityEvent('xss_attempt', 'input_validation', undefined, {
        input_type: type,
        input_length: input.length,
        patterns_detected: xssPatterns.filter(p => p.test(input)).length
      });
    }

    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/gi,
      /--/g,
      /\/\*/g,
      /\*\//g,
      /;/g
    ];

    const hasSqlInjection = sqlPatterns.some(pattern => pattern.test(input));
    
    if (hasSqlInjection) {
      errors.push('Potentially malicious SQL detected');
      logSecurityEvent('sql_injection_attempt', 'input_validation', undefined, {
        input_type: type,
        input_length: input.length
      });
    }

    // Length validation
    if (input.length > maxLength) {
      errors.push(`Input exceeds maximum length of ${maxLength} characters`);
    }

    // Type-specific validation and sanitization
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          errors.push('Invalid email format');
        }
        sanitizedValue = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
        break;

      case 'url':
        try {
          const url = new URL(input);
          if (!['http:', 'https:'].includes(url.protocol)) {
            errors.push('Only HTTP and HTTPS URLs are allowed');
          }
        } catch {
          errors.push('Invalid URL format');
        }
        sanitizedValue = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
        break;

      case 'html':
        sanitizedValue = DOMPurify.sanitize(input, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
          ALLOWED_ATTR: []
        });
        break;

      case 'search':
        // Remove special characters that could be used for injection
        sanitizedValue = input.replace(/[<>\"'%;()&+]/g, '');
        break;

      default:
        sanitizedValue = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
    }

    setValidationErrors(errors);

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors
    };
  };

  const validateNumericInput = (
    input: string | number,
    min?: number,
    max?: number
  ): ValidationResult => {
    const errors: string[] = [];
    const numValue = typeof input === 'string' ? parseFloat(input) : input;

    if (isNaN(numValue)) {
      errors.push('Invalid numeric value');
    }

    if (min !== undefined && numValue < min) {
      errors.push(`Value must be at least ${min}`);
    }

    if (max !== undefined && numValue > max) {
      errors.push(`Value must not exceed ${max}`);
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue: numValue.toString(),
      errors
    };
  };

  return {
    validateAndSanitizeInput,
    validateNumericInput,
    validationErrors
  };
};
