
import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface SafeHTMLProps {
  content: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

export const SafeHTML: React.FC<SafeHTMLProps> = ({ 
  content, 
  className = '',
  allowedTags = ['p', 'br', 'strong', 'em', 'u', 'span'],
  allowedAttributes = {}
}) => {
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: Object.keys(allowedAttributes).reduce((acc, tag) => {
        allowedAttributes[tag].forEach(attr => {
          if (!acc.includes(attr)) acc.push(attr);
        });
        return acc;
      }, [] as string[])
    });
  }, [content, allowedTags, allowedAttributes]);

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};
