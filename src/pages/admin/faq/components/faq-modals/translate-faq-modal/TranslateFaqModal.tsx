import { useMemo, useRef, useState } from 'react';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { FaqQuestion } from '@/types/admin/faq';
import { LocalizationLanguage } from '@/types/common/language';
import { ModalMode } from '@/types/admin/common';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { TranslateFaqForm, TranslateFaqFormRef, TranslateFaqFormValues } from './TranslateFaqForm';

interface TranslateFaqModalProps {
    isOpen: boolean;
    onClose: () => void;
    faqToTranslate: FaqQuestion | null;
    onTranslateFaq: (faq: FaqQuestion) => void;
    language: LocalizationLanguage;
}

export const TranslateFaqModal = ({
    isOpen,
    onClose,
    faqToTranslate,
    onTranslateFaq,
    language,
}: TranslateFaqModalProps) => {
    // Реф для доступа к методам формы
    const formRef = useRef<TranslateFaqFormRef>(null);

    // Стейт валидности для кнопки "Сохранить"
    const [isFormValid, setIsFormValid] = useState(false);

    // --- ЗАГЛУШКИ ДЛЯ API STATE ---
    // В реальном коде это придет из хука useTranslateFaq
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Определяем, есть ли уже перевод (Logic)
    const existingLocalization = useMemo(() => {
        // ВАЖНО: Проверь, как в типе FaqQuestion называется массив локализаций.
        // Обычно это 'localizations'. Если TypeScript ругается, добавь 'any' или обнови тип.
        // return faqToTranslate?.localizations?.find((loc) => loc.language.id === language.id);

        // ПОКА ВОЗВРАЩАЕМ NULL (как будто перевода нет, режим создания)
        return null;
    }, [faqToTranslate, language.id]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;

    // 2. Готовим начальные данные для формы
    const initialData = useMemo<TranslateFaqFormValues | null>(() => {
        if (!isEditMode || !existingLocalization) return null;

        return {
            question: existingLocalization.question, // или questionText
            answer: existingLocalization.answer, // или answerText
        };
    }, [existingLocalization, isEditMode]);

    // 3. Обработчики
    const handleSaveClick = () => {
        // Родитель (модалка) пинает ребенка (форму)
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => {
        return formRef.current?.isDirty() ?? false;
    };

    // 4. Submit (ЗАГЛУШКА API)
    const handleFormSubmit = async (data: TranslateFaqFormValues) => {
        setIsSubmitting(true);
        setError(null);

        console.log('SENDING DATA TO API:', {
            faqId: faqToTranslate?.id,
            languageId: language.id,
            data,
        });

        // Эмуляция задержки сети
        setTimeout(() => {
            setIsSubmitting(false);

            // Эмуляция успеха: возвращаем обновленный объект
            // В реальности тут будет ответ от сервера
            const mockUpdatedFaq = {
                ...faqToTranslate!,
                // Тут мы бы добавили новую локализацию в массив
            };

            onTranslateFaq(mockUpdatedFaq);
            onClose();
        }, 1000);
    };

    if (!faqToTranslate) return null;

    const modalTitle = isEditMode
        ? COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION
        : COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION;

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            onSave={handleSaveClick}
            isSubmitting={isSubmitting}
            isFormValid={isFormValid}
            checkIsDirty={checkIsDirty}
        >
            {/* Блок ошибки */}
            {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
                    {error}
                </div>
            )}

            <TranslateFaqForm
                ref={formRef}
                onSubmit={handleFormSubmit}
                initialData={initialData}
                onValidationChange={setIsFormValid}
            />
        </LocalizationModal>
    );
};
