import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SingleTitleDescriptionAuthorPairs } from './SingleTitleDescriptionAuthorPairs';
import { ProgramSectionMode } from '@/types/common/program-sections';

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

    return { root };
};

const getCarouselProps = () => mockCarousel.mock.calls[0]?.[0];
const getPairProps = (index: number) => mockPairCard.mock.calls.find((c) => c?.[0]?.index === index)?.[0];

describe('SingleTitleDescriptionAuthorPairs', () => {
    it('renders title as h2 in published mode', () => {
        setup({ title: 'Hello' });
        expect(screen.getByRole('heading', { level: 2, name: 'Hello' })).toBeInTheDocument();
    });

    it('renders title input in edit mode', () => {
        setup({ mode: ProgramSectionMode.Edit, title: 'Edit' });
        expect(screen.getByTestId('input-single-title-description-author-pairs-title')).toHaveValue('Edit');
    });

    it('calls onTitleChange with value in edit mode', () => {
        const onTitleChange = jest.fn();
        setup({ mode: ProgramSectionMode.Edit, onTitleChange });

        fireEvent.change(screen.getByTestId('input-single-title-description-author-pairs-title'), {
            target: { value: 'X' },
        });

        expect(onTitleChange).toHaveBeenCalledWith('X');
    });

    it('does not crash on title change without onTitleChange', () => {
        setup({ mode: ProgramSectionMode.Edit });

        fireEvent.change(screen.getByTestId('input-single-title-description-author-pairs-title'), {
            target: { value: 'X' },
        });

        expect(screen.getByTestId('input-single-title-description-author-pairs-title')).toBeInTheDocument();
    });

    it('uses carousel variant "default" in published mode', () => {
        setup({ pairs: [{ description: 'D0', author: 'A0' }] });
        expect(getCarouselProps().variant).toBe('default');
    });

    it('uses carousel variant "editable" in edit mode', () => {
        setup({ mode: ProgramSectionMode.Edit });
        expect(getCarouselProps().variant).toBe('editable');
    });

    it('uses carousel variant "template" in template mode', () => {
        setup({ mode: ProgramSectionMode.Template });
        expect(getCarouselProps().variant).toBe('template');
    });

    it('passes itemsCount based on pairs in published mode', () => {
        setup({
            pairs: [
                { description: 'D0', author: 'A0' },
                { description: 'D1', author: 'A1' },
            ],
        });

        expect(getCarouselProps().itemsCount).toBe(2);
    });

    it('normalizes template pairs to 5 items', () => {
        setup({ mode: ProgramSectionMode.Template, pairs: [{ description: 'D0', author: 'A0' }] });
        expect(getCarouselProps().itemsCount).toBe(5);
    });

    it('uses provided values in template mode when present', () => {
        setup({ mode: ProgramSectionMode.Template, pairs: [{ description: 'D0', author: 'A0' }] });

        const p0 = getPairProps(0);
        expect(p0.description).toBe('D0');
        expect(p0.author).toBe('A0');
    });

    it('fills missing values with samples in template mode', () => {
        setup({ mode: ProgramSectionMode.Template, pairs: [{ description: 'D0', author: 'A0' }] });

        const p4 = getPairProps(4);
        expect(p4.description).toBe('SAMPLE_DESC');
        expect(p4.author).toBe('SAMPLE_AUTHOR');
    });

    it('does not render add button in published mode', () => {
        setup();
        expect(screen.queryByRole('button', { name: 'Add card' })).not.toBeInTheDocument();
    });

    it('renders add button in edit mode', () => {
        setup({ mode: ProgramSectionMode.Edit });
        expect(screen.getByRole('button', { name: 'Add card' })).toBeInTheDocument();
    });

    it('calls onAddPair when add button clicked', () => {
        const onAddPair = jest.fn();
        setup({ mode: ProgramSectionMode.Edit, onAddPair });

        fireEvent.click(screen.getByRole('button', { name: 'Add card' }));

        expect(onAddPair).toHaveBeenCalledTimes(1);
    });

    it('disables add button when canAddPair=false', () => {
        setup({ mode: ProgramSectionMode.Edit, canAddPair: false });
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

    it('applies template class in template mode', () => {
        const { root } = setup({ mode: ProgramSectionMode.Template });
        expect(root).toHaveClass('template');
    });

    it('does not apply template class in edit mode', () => {
        const { root } = setup({ mode: ProgramSectionMode.Edit });
        expect(root).not.toHaveClass('template');
    });
});
