
import { forwardRef } from 'react';

interface SecureLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}

export const SecureLink = forwardRef<HTMLAnchorElement, SecureLinkProps>(
  ({ href, children, external = false, ...props }, ref) => {
    const isExternal = external || (href.startsWith('http') && !href.includes(window.location.hostname));
    
    return (
      <a
        ref={ref}
        href={href}
        {...(isExternal && {
          target: '_blank',
          rel: 'noopener noreferrer'
        })}
        {...props}
      >
        {children}
      </a>
    );
  }
);

SecureLink.displayName = 'SecureLink';
