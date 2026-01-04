import React, { memo } from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface SafeHtmlProps extends React.HTMLAttributes<HTMLElement> {
    html: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

const CONFIG = {
    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'br', 'span'],
    ALLOWED_ATTR: ['class'],
};

export const SafeHtml: React.FC<SafeHtmlProps> = memo(({ html, as: Component = 'div', className, ...props }) => {
    const sanitizedHtml = DOMPurify.sanitize(html, CONFIG);

    return <Component className={className} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} {...props} />;
});

SafeHtml.displayName = 'SafeHtml';
