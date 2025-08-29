import { ButtonTooltip } from '../../../../../components/admin/button-tooltip/ButtonTooltip';
import { VisibilityStatusLabel } from '../../../../../components/admin/visibility-status-label/VisibilityStatusLabel';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { FaqQuestion } from '../../../../../types/admin/faq';
import './FaqComponent.scss';

export interface FaqComponentProps {
    faq: FaqQuestion;
    handleOnDeleteFaq: (faq: FaqQuestion) => void;
    handleOnEditFaq: (faq: FaqQuestion) => void;
}

export const FaqComponent = ({ faq, handleOnDeleteFaq, handleOnEditFaq }: FaqComponentProps) => {
    const handleEditFaq = () => {
        handleOnEditFaq(faq);
    };

    const handleDeleteFaq = () => {
        handleOnDeleteFaq(faq);
    };

    return (
        <div className="admin-page_faq-item">
            <div className="faq-info">
                <div className="faq-info-question">
                    <p>{faq.questionText}</p>
                </div>
                <div className="faq-info-answer">
                    <p>{faq.answerText}</p>
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
                                ? COMMON_TEXT_ADMIN.TOOLTIP.PUBLISHED_IN
                                : COMMON_TEXT_ADMIN.TOOLTIP.DRAFTED_IN}
                        </b>
                        {faq.pages.map((p) => (
                            <span key={p.id}>{p.title}</span>
                        ))}
                    </div>
                </ButtonTooltip>
                <div className="faq-actions-buttons">
                    <button type="button" onClick={handleEditFaq} className="edit-btn" />
                    <button type="button" onClick={handleDeleteFaq} className="delete-btn" />
                </div>
            </div>
        </div>
    );
};
