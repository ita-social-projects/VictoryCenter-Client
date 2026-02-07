import React, { memo } from 'react';
import { Button } from '@/components/public/ui/button';
import { BackgroundMedia } from '@/components/public/background-media';
import { SafeHtml } from '@/components/common/safe-html';
import styles from './CtaSection.module.scss';

interface CtaButtonConfig {
    label: string;
    href?: string;
    onClick?: () => void;
}

interface CtaSectionProps {
    title: string;
    description: string;
    mediaUrl: string;
    buttons: [CtaButtonConfig] | [CtaButtonConfig, CtaButtonConfig];
}

export const CtaSection: React.FC<CtaSectionProps> = memo(({ title, description, mediaUrl, buttons }) => {
    return (
        <section className={styles.root}>
            <BackgroundMedia mediaUrl={mediaUrl} />
            <div className={styles.content}>
                <SafeHtml as="h2" html={title} className={styles.title} />
                <p className={styles.description}>{description}</p>
                <div className={styles.actions}>
                    {buttons.map((btn, index) => {
                        const variant = index === 0 ? 'primary-light' : 'secondary-light';

                        return (
                            <Button
                                key={`${btn.href}-${index}`}
                                href={btn.href}
                                onClick={btn.onClick}
                                variant={variant}
                                className={styles.button}
                            >
                                {btn.label}
                            </Button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
});

CtaSection.displayName = 'CtaSection';
