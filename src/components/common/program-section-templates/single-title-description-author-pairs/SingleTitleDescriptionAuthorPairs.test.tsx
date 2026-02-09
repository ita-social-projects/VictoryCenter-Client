import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SingleTitleDescriptionAuthorPairs } from './SingleTitleDescriptionAuthorPairs';

const mockCarousel = jest.fn();
const mockPairCard = jest.fn();

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, id }: any) => (
        <input data-testid={`input-${id}`} value={value} onChange={onChange} />
    ),
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled }: any) => (
        <button type="button" onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

jest.mock('./card-carousel/CardCarousel', () => ({
    CardCarousel: (props: any) => {
        mockCarousel(props);
        return <div data-testid="carousel">{props.children}</div>;
    },
}));

jest.mock('./description-author-pair-card/DescriptionAuthorPairCard', () => ({
    DescriptionAuthorPairCard: (props: any) => {
        mockPairCard(props);
        return <div data-testid={`pair-${props.index}`}>{`${props.description}|${props.author}`}</div>;
    },
}));

jest.mock('@/assets/icons/arrow-left.svg', () => ({
    ReactComponent: () => <svg data-testid="arrow-left" />,
}));

jest.mock('@/assets/icons/arrow-right.svg', () => ({
    ReactComponent: () => <svg data-testid="arrow-right" />,
}));

jest.mock('@/assets/icons/plus.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="plus" {...props} />,
}));

jest.mock('@/const/admin/programs', () => ({
    PROGRAMS_TEXT: {
        SECTION: {
            DESCRIPTION_SAMPLE_TEXT_SHORT: 'SAMPLE_DESC',
            FORM: { TITLE: { TEXT: 'Title', PLACEHOLDER: 'Title placeholder' } },
            CARD: {
                FORM: { SAMPLE: { AUTHOR: 'SAMPLE_AUTHOR' } },
                BUTTON: { ADD_CARD: 'Add card' },
            },
        },
    },
    PROGRAM_SECTION_VALIDATION: {
        title: { max: 100 },
    },
}));

const setup = (props: React.ComponentProps<typeof SingleTitleDescriptionAuthorPairs> = {}) => {
    mockCarousel.mockClear();
    mockPairCard.mockClear();
    const utils = render(<SingleTitleDescriptionAuthorPairs {...props} />);
    const root = utils.container.firstElementChild as HTMLElement;
    return { ...utils, root };
};

const getCarouselProps = () => mockCarousel.mock.calls[0]?.[0];
const getPairProps = (index: number) => mockPairCard.mock.calls.find((c) => c?.[0]?.index === index)?.[0];

describe('SingleTitleDescriptionAuthorPairs', () => {
    it('renders title as h2 when not editable', () => {
        setup({ title: 'Hello' });
        expect(screen.getByRole('heading', { level: 2, name: 'Hello' })).toBeInTheDocument();
    });

    it('renders title input when editable', () => {
        setup({ isEditable: true, title: 'Edit' });
        expect(screen.getByTestId('input-single-title-description-author-pairs-title')).toHaveValue('Edit');
    });

    it('calls onTitleChange with value', () => {
        const onTitleChange = jest.fn();
        setup({ isEditable: true, onTitleChange });

        fireEvent.change(screen.getByTestId('input-single-title-description-author-pairs-title'), {
            target: { value: 'X' },
        });

        expect(onTitleChange).toHaveBeenCalledWith('X');
    });

    it('does not crash on title change without onTitleChange', () => {
        setup({ isEditable: true });

        fireEvent.change(screen.getByTestId('input-single-title-description-author-pairs-title'), {
            target: { value: 'X' },
        });

        expect(screen.getByTestId('input-single-title-description-author-pairs-title')).toBeInTheDocument();
    });

    it('uses carousel variant "default" when not template and not editable', () => {
        setup({ pairs: [{ description: 'D0', author: 'A0' }] });
        expect(getCarouselProps().variant).toBe('default');
    });

    it('uses carousel variant "editable" when editable', () => {
        setup({ isEditable: true });
        expect(getCarouselProps().variant).toBe('editable');
    });

    it('uses carousel variant "template" when template and not editable', () => {
        setup({ isTemplate: true });
        expect(getCarouselProps().variant).toBe('template');
    });

    it('passes itemsCount based on pairs when not template', () => {
        setup({
            pairs: [
                { description: 'D0', author: 'A0' },
                { description: 'D1', author: 'A1' },
            ],
        });
        expect(getCarouselProps().itemsCount).toBe(2);
    });

    it('normalizes template pairs to 5 items', () => {
        setup({ isTemplate: true, pairs: [{ description: 'D0', author: 'A0' }] });
        expect(getCarouselProps().itemsCount).toBe(5);
    });

    it('uses provided values in template mode when present', () => {
        setup({ isTemplate: true, pairs: [{ description: 'D0', author: 'A0' }] });

        const p0 = getPairProps(0);
        expect(p0.description).toBe('D0');
        expect(p0.author).toBe('A0');
    });

    it('fills missing values with samples in template mode', () => {
        setup({ isTemplate: true, pairs: [{ description: 'D0', author: 'A0' }] });

        const p4 = getPairProps(4);
        expect(p4.description).toBe('SAMPLE_DESC');
        expect(p4.author).toBe('SAMPLE_AUTHOR');
    });

    it('renders add button only when editable', () => {
        setup();
        expect(screen.queryByRole('button', { name: 'Add card' })).not.toBeInTheDocument();

        setup({ isEditable: true });
        expect(screen.getByRole('button', { name: 'Add card' })).toBeInTheDocument();
    });

    it('calls onAddPair when add button clicked', () => {
        const onAddPair = jest.fn();
        setup({ isEditable: true, onAddPair });

        fireEvent.click(screen.getByRole('button', { name: 'Add card' }));

        expect(onAddPair).toHaveBeenCalledTimes(1);
    });

    it('disables add button when canAddPair=false', () => {
        setup({ isEditable: true, canAddPair: false });
        expect(screen.getByRole('button', { name: 'Add card' })).toBeDisabled();
    });

    it('passes handlers to pair card', () => {
        const onPairDescriptionChange = jest.fn();
        const onPairAuthorChange = jest.fn();
        const onDeletePair = jest.fn();

        setup({
            pairs: [{ description: 'D0', author: 'A0' }],
            onPairDescriptionChange,
            onPairAuthorChange,
            onDeletePair,
        });

        const p0 = getPairProps(0);
        expect(p0.onDescriptionChange).toBe(onPairDescriptionChange);
        expect(p0.onAuthorChange).toBe(onPairAuthorChange);
        expect(p0.onDelete).toBe(onDeletePair);
    });

    it('applies template class only when template and not editable', () => {
        const { root } = setup({ isTemplate: true });
        expect(root).toHaveClass('template');
    });

    it('does not apply template class when editable', () => {
        const { root } = setup({ isTemplate: true, isEditable: true });
        expect(root).not.toHaveClass('template');
    });
});
