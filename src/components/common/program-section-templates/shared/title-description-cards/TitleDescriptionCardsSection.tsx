import { parseDescriptionList } from '@/utils/functions/formatters/text-formatters';
import './TitleDescriptionCardsSection.scss';
import cn from 'classnames';

export interface TitleDescriptionCard {
    title: string;
    description: string;
}

interface Props {
    cards: TitleDescriptionCard[];
    cardsCount: number;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (index: number, value: string) => void;
    onDescriptionChange?: (index: number, value: string) => void;
}

export const TitleDescriptionCardsSection = ({
    cards,
    cardsCount,
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
}: Props) => {
    const normalizedCards = Array.from({ length: cardsCount }).map(
        (_, index) => cards[index] ?? { title: '', description: '' },
    );

    return (
        <div
            className={cn('td-cards', {
                dual: cardsCount === 2,
                triple: cardsCount === 3,
                quad: cardsCount === 4,
                template: isTemplate,
            })}
        >
            {normalizedCards.map((card, index) => {
                const { intro, items } = parseDescriptionList(card.description);

                return (
                    <div className="td-card" key={index}>
                        {isEditable ? (
                            <>
                                <input value={card.title} onChange={(e) => onTitleChange?.(index, e.target.value)} />
                                <textarea
                                    value={card.description}
                                    onChange={(e) => onDescriptionChange?.(index, e.target.value)}
                                />
                            </>
                        ) : (
                            <>
                                <h3 className="title">{card.title || 'Заголовок'}</h3>
                                <div className="description">
                                    {intro && <p className="description-intro">{intro}</p>}

                                    {items.length > 0 && (
                                        <ul className="description-list">
                                            {items.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    )}

                                    {!intro && items.length === 0 && <p>Опис секції</p>}
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
