import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import FocusLock from 'react-focus-lock';
import { ContactFormCard } from '@/pages/public/contact-us/components/contact-form-card/ContactFormCard';
import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg';
import styles from './ContactFormPopUp.module.scss';
import { CONTACT_US_PAGE_DATA } from '@/utils/mock-data/public/contact-us-page';

interface ContactFormPopUpProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ContactFormPopUp: React.FC<ContactFormPopUpProps> = ({ isOpen, onClose }) => {
    const isMouseDownOnOverlay = useRef(false);

    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleGlobalKeyDown);
        } else {
            document.body.style.overflow = originalStyle;
            document.removeEventListener('keydown', handleGlobalKeyDown);
        }

        return () => {
            document.body.style.overflow = originalStyle;
            document.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [isOpen, onClose]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            isMouseDownOnOverlay.current = true;
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMouseDownOnOverlay.current && e.target === e.currentTarget) {
            onClose();
        }
        isMouseDownOnOverlay.current = false;
    };

    if (!isOpen) return null;

    const modalContent = (
        <div
            className={styles.overlay}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            data-testid="popup-overlay"
            aria-hidden="true"
        >
            <FocusLock>
                <aside role="presentation" className={styles.popup} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Закрити форму">
                        <CrossIcon width="24" height="24" />
                    </button>

                    <div className={styles.content}>
                        <h2 className={styles.title}>
                            {CONTACT_US_PAGE_DATA.contactFormHeader1}
                            <br />
                            {CONTACT_US_PAGE_DATA.contactFormHeader2}
                        </h2>

                        <ContactFormCard
                            isPopup={true}
                            title={CONTACT_US_PAGE_DATA.formLabel}
                            namePlaceholder={CONTACT_US_PAGE_DATA.namePlaceholder}
                            emailPlaceholder={CONTACT_US_PAGE_DATA.emailPlaceholder}
                            subjectPlaceholder={CONTACT_US_PAGE_DATA.subjectPlaceholder}
                            messagePlaceholder={CONTACT_US_PAGE_DATA.messagePlaceholder}
                            submitLabel={CONTACT_US_PAGE_DATA.submitButton}
                        />
                    </div>
                </aside>
            </FocusLock>
        </div>
    );

    return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
