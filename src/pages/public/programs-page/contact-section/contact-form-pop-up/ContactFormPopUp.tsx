import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ContactFormCard } from '@/pages/public/contact-us/components/contact-form-card/ContactFormCard';
import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg';
import styles from './ContactFormPopUp.module.scss';

interface ContactFormPopUpProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ContactFormPopUp: React.FC<ContactFormPopUpProps> = ({ isOpen, onClose }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const isMouseDownOnOverlay = useRef(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === overlayRef.current) {
            isMouseDownOnOverlay.current = true;
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMouseDownOnOverlay.current && e.target === overlayRef.current) {
            onClose();
        }
        isMouseDownOnOverlay.current = false;
    };

    if (!isOpen) return null;

    const modalContent = (
        <div
            className={styles.overlay}
            ref={overlayRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            data-testid="popup-overlay"
        >
            <aside className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Закрити форму">
                    <CrossIcon width="24" height="24" />
                </button>

                <div className={styles.content}>
                    <h2 className={styles.title}>
                        МИ ЗАВЖДИ
                        <br />
                        ВІДКРИТІ ДЛЯ ВАС
                    </h2>

                    <ContactFormCard
                        isPopup={true}
                        title="Контактна форма"
                        namePlaceholder="Ваше ім'я"
                        emailPlaceholder="E-mail"
                        subjectPlaceholder="Тема звернення"
                        messagePlaceholder="Напишіть ваше повідомлення"
                        submitLabel="Надіслати"
                    />
                </div>
            </aside>
        </div>
    );

    return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
