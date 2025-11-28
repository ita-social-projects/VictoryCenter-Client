import { ButtonTooltip } from '../../../../../components/admin/button-tooltip/ButtonTooltip';
import { VisibilityStatusLabel } from '../../../../../components/admin/visibility-status-label/VisibilityStatusLabel';
import { FAQ_TEXT } from '../../../../../const/admin/faq';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { FaqQuestion } from '../../../../../types/admin/faq';
import styles from './FaqComponent.module.scss';

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
        <div className={styles['admin-page_faq-item']}>
            <div className={styles['faq-info']}>
                <div className={styles['faq-info-question']}>
                    <p>{faq.questionText}</p>
                </div>
                <div className={styles['faq-info-answer']}>
                    <p>{faq.answerText}</p>
                </div>
                <div className={styles['faq-info-status']}>
                    <VisibilityStatusLabel status={faq.status} />
                </div>
            </div>
            <div className={styles['faq-actions']}>
                <ButtonTooltip position="bottom">
                    <div className={styles['faq-actions-tooltip']}>
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
                <div className={styles['faq-actions-buttons']}>
                    <button type="button" onClick={handleEditFaq} className={styles['faq-edit-btn']} />
                    <button type="button" onClick={handleDeleteFaq} className={styles['faq-delete-btn']} />
                </div>
            </div>
        </div>
    );
};
