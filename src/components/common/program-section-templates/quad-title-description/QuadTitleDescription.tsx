import cn from 'classnames';
import { TitleDescriptionCardsSection } from '../shared/title-description-cards/TitleDescriptionCardsSection';
import styles from './QuadTitleDescription.module.scss';

export const QuadTitleDescription = ({ isTemplate = false, isEditable = false, ...props }: any) => {
    return (
        <div
            className={cn(styles.container, {
                [styles.template]: isTemplate,
                [styles.editable]: isEditable,
            })}
        >
            <TitleDescriptionCardsSection {...props} cardsCount={4} isTemplate={isTemplate} isEditable={isEditable} />
        </div>
    );
};
