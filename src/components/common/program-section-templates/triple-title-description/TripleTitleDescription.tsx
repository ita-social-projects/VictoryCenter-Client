import cn from 'classnames';
import { TitleDescriptionCardsSection } from '../shared/title-description-cards/TitleDescriptionCardsSection';
import styles from './TripleTitleDescription.module.scss';

export const TripleTitleDescription = ({ isTemplate = false, isEditable = false, ...props }: any) => {
    return (
        <div
            className={cn(styles.container, {
                [styles.template]: isTemplate,
                [styles.editable]: isEditable,
            })}
        >
            <TitleDescriptionCardsSection {...props} cardsCount={3} isTemplate={isTemplate} isEditable={isEditable} />
        </div>
    );
};
