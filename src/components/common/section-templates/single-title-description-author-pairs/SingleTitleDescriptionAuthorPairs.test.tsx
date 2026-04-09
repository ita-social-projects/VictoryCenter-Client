import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SingleTitleDescriptionAuthorPairs } from './SingleTitleDescriptionAuthorPairs';
import { SectionMode, SectionTemplate } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';

const mockCardCarousel = jest.fn();
const mockDescriptionAuthorPairCard = jest.fn();
const mockConfirmationModal = jest.fn();

jest.mock('@/utils/functions/section-template-validation/sectionTemplateValidation', () => ({
    getSectionTemplateMaxLength: jest.fn(),
}));

jest.mock('@/validation/admin/program-schema/program-schema', () => ({
    PROGRAM_SECTION_VALIDATION_FUNCTIONS: {
        validateContentText: jest.fn(),
    },
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: (props: any) => {
        mockConfirmationModal(props);
        return (
            <div data-testid="confirmation-modal" data-open={props.isOpen ? '1' : '0'}>
                <div data-testid="confirmation-modal-title">{props.title}</div>
                <button data-testid="confirmation-modal-confirm" type="button" onClick={props.onConfirm}>
                    confirm
                </button>
                <button data-testid="confirmation-modal-cancel" type="button" onClick={props.onCancel}>
                    cancel
                </button>
            </div>
        );
    },
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, onBlur, id, error, showCounterBelow }: any) => (
        <div data-testid={`group-${id}`} data-show-counter-below={String(showCounterBelow)}>
            <label htmlFor={`input-${id}`}>{id}</label>
            <input id={`input-${id}`} data-testid={`input-${id}`} value={value} onChange={onChange} onBlur={onBlur} />
            <div data-testid={`error-${id}`}>{error ?? ''}</div>
        </div>
    ),
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, type = 'button' }: any) => (
        <button type={type} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

jest.mock('./card-carousel/CardCarousel', () => ({
    CardCarousel: (props: any) => {
        mockCardCarousel(props);
        return <div data-testid="carousel">{props.children}</div>;
    },
}));

jest.mock('./description-author-pair-card/DescriptionAuthorPairCard', () => ({
    DescriptionAuthorPairCard: (props: any) => {
        mockDescriptionAuthorPairCard(props);
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
            FORM: { TITLE: { TEXT: 'Title' } },
            CARD: {
                FORM: { SAMPLE: { AUTHOR: 'SAMPLE_AUTHOR' } },
                BUTTON: { ADD_CARD: 'Add block' },
            },
            SINGLE_TITLE_DESCRIPTION_AUTHOR_PAIRS: {
                TITLE_PLACEHOLDER: '',
                MODAL: { DELETE_BLOCK_CONFIRMATION: 'Delete block?' },
            },
        },
    },
}));

jest.mock('@/const/admin/common', () => ({
    COMMON_TEXT_ADMIN: {
        BUTTON: { YES: 'Yes', NO: 'No' },
        VALIDATION_MESSAGE: {
            FIELD_REQUIRED: 'Field required',
            getMinError: jest.fn((min: number) => `Min ${min}`),
            getMaxError: jest.fn((max: number) => `Max ${max}`),
            getImageDimensionError: jest.fn(),
        },
    },
}));

type ComponentProps = React.ComponentProps<typeof SingleTitleDescriptionAuthorPairs>;

const pair = (description: string, author: string) => ({ description, author });
const pairs = (...items: Array<ReturnType<typeof pair>>) => items;

const getTemplateMaxLengthMock = () => {
    const mod = jest.requireMock(
        '@/utils/functions/section-template-validation/sectionTemplateValidation',
    );
    return mod.getSectionTemplateMaxLength as jest.Mock;
};

const getValidateContentTextMock = () => {
    const mod = jest.requireMock('@/validation/admin/program-schema/program-schema');
    return mod.PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText as jest.Mock;
};

const renderComponent = (overrideProps: Partial<ComponentProps> = {}) => {
    mockCardCarousel.mockClear();
    mockDescriptionAuthorPairCard.mockClear();
    mockConfirmationModal.mockClear();

    const getSectionTemplateMaxLength = getTemplateMaxLengthMock();
    const validateContentText = getValidateContentTextMock();

    getSectionTemplateMaxLength.mockReset();
    validateContentText.mockReset();

    getSectionTemplateMaxLength.mockReturnValue(50);
    validateContentText.mockReturnValue(undefined);

    const defaultProps: ComponentProps = {
        title: '',
        pairs: [],
        mode: SectionMode.View,
        canAddPair: true,
    };

    const props: ComponentProps = { ...defaultProps, ...overrideProps };
    const utils = render(<SingleTitleDescriptionAuthorPairs {...props} />);
    const root = utils.container.firstElementChild as HTMLElement;

    return { root, ...utils };
};

const getCardCarouselProps = () => mockCardCarousel.mock.calls[0]?.[0];
const getPairCardProps = (index: number) =>
    mockDescriptionAuthorPairCard.mock.calls.find((call) => call?.[0]?.index === index)?.[0];
const getConfirmationModalProps = () => mockConfirmationModal.mock.calls.at(-1)?.[0];

const openDeleteModal = async (index: number) => {
    act(() => {
        getPairCardProps(index).onDelete(index);
    });
    await waitFor(() => expect(screen.getByTestId('confirmation-modal')).toHaveAttribute('data-open', '1'));
};

describe('SingleTitleDescriptionAuthorPairs', () => {
    it('renders h2 title in view mode and uses default carousel variant', () => {
        const { root } = renderComponent({
            title: 'Hello',
            pairs: pairs(pair('D0', 'A0')),
        });

        expect(screen.getByRole('heading', { level: 2, name: 'Hello' })).toBeInTheDocument();
        expect(getCardCarouselProps().variant).toBe('default');
        expect(getCardCarouselProps().itemsCount).toBe(1);

        expect(root).not.toHaveClass('template');
        expect(root).not.toHaveClass('editable');
    });

    it('renders title input in edit mode, uppercases on change, and does not validate when no error yet', () => {
        const onTitleChange = jest.fn();
        const { root } = renderComponent({
            mode: SectionMode.Edit,
            title: 'Edit',
            onTitleChange,
        });

        expect(screen.getByTestId('input-single-title-description-author-pairs-title')).toHaveValue('Edit');
        expect(screen.getByTestId('group-single-title-description-author-pairs-title')).toHaveAttribute(
            'data-show-counter-below',
            'true',
        );

        fireEvent.change(screen.getByTestId('input-single-title-description-author-pairs-title'), {
            target: { value: 'ab' },
        });

        expect(onTitleChange).toHaveBeenCalledWith('AB');
        expect(getValidateContentTextMock()).not.toHaveBeenCalled();

        expect(getCardCarouselProps().variant).toBe('editable');
        expect(root).toHaveClass('editable');
        expect(root).not.toHaveClass('template');
    });

    it('does not render title input in View mode', () => {
        renderComponent({ mode: SectionMode.View, title: 'X' });

        expect(screen.queryByTestId('input-single-title-description-author-pairs-title')).not.toBeInTheDocument();
        expect(getValidateContentTextMock().mock.calls.length).toBe(0);
    });

    it('validates title on blur and re-validates on change when error already exists (with correct args)', async () => {
        const onTitleChange = jest.fn();

        renderComponent({ mode: SectionMode.Edit, title: '', onTitleChange });

        const validateContentText = getValidateContentTextMock();
        validateContentText.mockReturnValueOnce('ERR_TITLE');
        validateContentText.mockReturnValueOnce('ERR_AFTER_CHANGE');

        fireEvent.blur(screen.getByTestId('input-single-title-description-author-pairs-title'));

        await waitFor(() =>
            expect(screen.getByTestId('error-single-title-description-author-pairs-title')).toHaveTextContent(
                'ERR_TITLE',
            ),
        );

        expect(validateContentText.mock.calls[0]).toEqual([
            '',
            ContentType.Title,
            true,
            SectionTemplate.SingleTitleDescriptionAuthorPairs,
        ]);

        fireEvent.change(screen.getByTestId('input-single-title-description-author-pairs-title'), {
            target: { value: 'abc' },
        });

        expect(onTitleChange).toHaveBeenCalledWith('ABC');

        await waitFor(() =>
            expect(screen.getByTestId('error-single-title-description-author-pairs-title')).toHaveTextContent(
                'ERR_AFTER_CHANGE',
            ),
        );

        expect(validateContentText.mock.calls[1]).toEqual([
            'ABC',
            ContentType.Title,
            true,
            SectionTemplate.SingleTitleDescriptionAuthorPairs,
        ]);
    });

    it('normalizes template pairs to 5 and uses sample values for missing items', () => {
        const { root } = renderComponent({
            mode: SectionMode.Template,
            pairs: pairs(pair('D0', 'A0')),
        });

        expect(getCardCarouselProps().variant).toBe('template');
        expect(getCardCarouselProps().itemsCount).toBe(5);

        expect(screen.getAllByTestId(/pair-/)).toHaveLength(5);

        expect(getPairCardProps(0).description).toBe('D0');
        expect(getPairCardProps(0).author).toBe('A0');
        expect(getPairCardProps(0).isEditable).toBe(false);

        expect(getPairCardProps(4).description).toBe('SAMPLE_DESC');
        expect(getPairCardProps(4).author).toBe('SAMPLE_AUTHOR');
        expect(getPairCardProps(4).isEditable).toBe(false);

        expect(root).toHaveClass('template');
        expect(root).not.toHaveClass('editable');
    });

    it('renders add button only in edit mode and respects canAddPair', () => {
        const view = renderComponent({ mode: SectionMode.View });
        expect(screen.queryByRole('button', { name: 'Add block' })).not.toBeInTheDocument();
        view.unmount();

        const onAddPair = jest.fn();

        const utils = renderComponent({
            mode: SectionMode.Edit,
            onAddPair,
            canAddPair: false,
        });
        expect(screen.getByRole('button', { name: 'Add block' })).toBeDisabled();
        utils.unmount();

        renderComponent({ mode: SectionMode.Edit, onAddPair, canAddPair: true });
        fireEvent.click(screen.getByRole('button', { name: 'Add block' }));
        expect(onAddPair).toHaveBeenCalledTimes(1);
    });

    it('passes editability and change handlers into cards (delete is wrapped by index)', async () => {
        const onPairDescriptionChange = jest.fn();
        const onPairAuthorChange = jest.fn();
        const onDeletePair = jest.fn();

        renderComponent({
            mode: SectionMode.Edit,
            pairs: pairs(pair('D0', 'A0'), pair('D1', 'A1')),
            onPairDescriptionChange,
            onPairAuthorChange,
            onDeletePair,
        });

        const p0 = getPairCardProps(0);
        expect(p0.isEditable).toBe(true);
        expect(p0.index).toBe(0);
        expect(p0.onDescriptionChange).toBe(onPairDescriptionChange);
        expect(p0.onAuthorChange).toBe(onPairAuthorChange);
        expect(typeof p0.onDelete).toBe('function');
        expect(p0.onDelete).not.toBe(onDeletePair);

        await openDeleteModal(0);
    });

    it('delete flow: blocks delete when not editable / when onDeletePair missing / when pairs length <= 1', () => {
        const onDeletePair = jest.fn();

        {
            const view = renderComponent({
                mode: SectionMode.View,
                pairs: pairs(pair('D0', 'A0'), pair('D1', 'A1')),
                onDeletePair,
            });

            act(() => {
                getPairCardProps(1).onDelete(1);
            });

            expect(screen.getByTestId('confirmation-modal')).toHaveAttribute('data-open', '0');
            expect(onDeletePair).not.toHaveBeenCalled();

            view.unmount();
        }

        {
            const view = renderComponent({
                mode: SectionMode.Edit,
                pairs: pairs(pair('D0', 'A0'), pair('D1', 'A1')),
            });

            act(() => {
                getPairCardProps(1).onDelete(1);
            });

            expect(screen.getByTestId('confirmation-modal')).toHaveAttribute('data-open', '0');

            view.unmount();
        }

        {
            const view = renderComponent({
                mode: SectionMode.Edit,
                pairs: pairs(pair('D0', 'A0')),
                onDeletePair,
            });

            act(() => {
                getPairCardProps(0).onDelete(0);
            });

            expect(screen.getByTestId('confirmation-modal')).toHaveAttribute('data-open', '0');
            expect(onDeletePair).not.toHaveBeenCalled();

            view.unmount();
        }
    });

    it('delete flow: confirm without pending index does nothing; open -> cancel closes; open -> close closes; open -> confirm calls onDeletePair(index)', async () => {
        const onDeletePair = jest.fn();

        renderComponent({
            mode: SectionMode.Edit,
            pairs: pairs(pair('D0', 'A0'), pair('D1', 'A1')),
            onDeletePair,
        });

        fireEvent.click(screen.getByTestId('confirmation-modal-confirm'));
        expect(onDeletePair).not.toHaveBeenCalled();

        await openDeleteModal(1);

        fireEvent.click(screen.getByTestId('confirmation-modal-cancel'));
        expect(onDeletePair).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.getByTestId('confirmation-modal')).toHaveAttribute('data-open', '0'));

        await openDeleteModal(1);

        act(() => {
            getConfirmationModalProps().onClose();
        });
        await waitFor(() => expect(screen.getByTestId('confirmation-modal')).toHaveAttribute('data-open', '0'));

        await openDeleteModal(1);

        fireEvent.click(screen.getByTestId('confirmation-modal-confirm'));
        expect(onDeletePair).toHaveBeenCalledWith(1);
        await waitFor(() => expect(screen.getByTestId('confirmation-modal')).toHaveAttribute('data-open', '0'));
    });

    it('calls getSectionTemplateMaxLength for title', () => {
        renderComponent({ mode: SectionMode.Edit });

        const getSectionTemplateMaxLength = getTemplateMaxLengthMock();
        expect(getSectionTemplateMaxLength).toHaveBeenCalledWith(
            SectionTemplate.SingleTitleDescriptionAuthorPairs,
            ContentType.Title,
        );
    });

    it('does not crash on title change without onTitleChange', () => {
        renderComponent({ mode: SectionMode.Edit });

        fireEvent.change(screen.getByTestId('input-single-title-description-author-pairs-title'), {
            target: { value: 'x' },
        });

        expect(screen.getByTestId('input-single-title-description-author-pairs-title')).toBeInTheDocument();
    });
});
