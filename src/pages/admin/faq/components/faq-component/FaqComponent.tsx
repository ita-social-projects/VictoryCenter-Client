import { ButtonTooltip } from '@/components/admin/button-tooltip/ButtonTooltip';
import { VisibilityStatusLabel } from '@/components/admin/visibility-status-label/VisibilityStatusLabel';
import { FAQ_TEXT } from '@/const/admin/faq';
import { VisibilityStatus } from '@/types/admin/common';
import { FaqLocalizableFields, FaqQuestion } from '@/types/admin/faq';
import './FaqComponent.scss';
import { LocalizationLanguage } from '@/types/common/language';
import { useEffect, useState } from 'react';
import { returnDisplayedLocalization } from '@/utils/functions/localization/localization';
import { LocalizationStatuses } from '@/components/admin/localization-statuses/LocalizationStatuses';

export interface FaqComponentProps {
    faq: FaqQuestion;
    language: LocalizationLanguage;
    translationLanguages: LocalizationLanguage[];
    handleOnDeleteFaq: (faq: FaqQuestion) => void;
    handleOnEditFaq: (faq: FaqQuestion) => void;
    handleOnTranslateFaq: (faq: FaqQuestion) => void;
}

export const FaqComponent = ({
    faq,
    handleOnDeleteFaq,
    handleOnEditFaq,
    language,
    translationLanguages,
    handleOnTranslateFaq,
}: FaqComponentProps) => {
    const [textFields, setTextFields] = useState<FaqLocalizableFields>();

    useEffect(() => {
        const displayedLocalization = returnDisplayedLocalization(faq, language.code);
        setTextFields({
            questionText: displayedLocalization?.questionText || faq.questionText,
            answerText: displayedLocalization?.answerText || faq.answerText,
        });
    }, [language, faq]);

    const handleEditFaq = () => {
        handleOnEditFaq(faq);
    };

    const handleDeleteFaq = () => {
        handleOnDeleteFaq(faq);
    };

    const handleTranslateFaq = () => {
        handleOnTranslateFaq(faq);
    };

    return (
        <div className="admin-page_faq-item">
            <div className="faq-info">
                <div className="faq-info-question">
                    <p>{textFields?.questionText}</p>
                    <LocalizationStatuses languages={translationLanguages} localizedEntity={faq} />
                </div>
                <div className="faq-info-answer">
                    <p>{textFields?.answerText}</p>
                </div>
                <div className="faq-info-status">
                    <VisibilityStatusLabel status={faq.status} />
                </div>
            </div>
            <div className="faq-actions">
                <ButtonTooltip position="bottom">
                    <div className="faq-actions-tooltip">
                        <b>
                            {faq.status === VisibilityStatus.Published
                                ? FAQ_TEXT.TOOLTIP.PUBLISHED_IN
                                : FAQ_TEXT.TOOLTIP.DRAFTED_IN}
                        </b>
                        {faq.pages.map((p) => (
                            <span key={p.id}>{p.title}</span>
                        ))}
                    </div>
                </ButtonTooltip>
                <div className="faq-actions-buttons">
                    <button type="button" onClick={handleTranslateFaq} className="faq-translate-btn disable" disabled />
                    <button type="button" onClick={handleEditFaq} className="faq-edit-btn" />
                    <button type="button" onClick={handleDeleteFaq} className="faq-delete-btn" />
                </div>
            </div>
        </div>
    );
};
