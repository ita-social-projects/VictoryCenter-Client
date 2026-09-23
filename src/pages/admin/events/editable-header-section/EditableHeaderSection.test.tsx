import '@testing-library/jest-dom';
import { useState } from 'react';
import { fireEvent, getDefaultNormalizer, render, screen } from '@testing-library/react';
import { RichTextInputGroupProps } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EVENTS_TEXT } from '@/const/admin/events';
import { EditableHeaderSection, EditableHeaderSectionProps, normalizeEventsDraftHtml } from './EditableHeaderSection';

const TEST_EVENTS_INTRO_CONTENT = {
    eventsBlockTitle: '<p>Тестовий заголовок</p>',
    pageDescription: '<p>Тестовий опис подій</p>',
};

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: ({
        value,
        onChange,
        onBlur,
        maxLength,
        label,
        id,
        name,
        disabled,
        placeholder,
        hideToolbar,
    }: RichTextInputGroupProps) => {
        const mockParser = new globalThis.DOMParser();
        const visibleText = mockParser.parseFromString(value, 'text/html').body.textContent ?? '';
        const mockReact = require('react');
        const [isFocused, setFocused] = mockReact.useState(false);

        return (
            <div>
                <div data-testid="rich-text-value" data-hide-toolbar={hideToolbar}>
                    {value}
                </div>
                <input
                    id={id}
                    name={name}
                    aria-label={label}
                    disabled={disabled}
                    placeholder={placeholder}
                    value={visibleText}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                        setFocused(false);
                        onBlur?.();
                    }}
                    onChange={(event) => onChange(`<p>${event.target.value}</p>`)}
                />
                <output>
                    {visibleText.length}/{maxLength}
                </output>
                {isFocused && visibleText && (
                    <button type="button" aria-label="Clear input" onClick={() => onChange('')}>
                        Clear
                    </button>
                )}
            </div>
        );
    },
}));

const defaultProps: EditableHeaderSectionProps = {
    sectionId: EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID,
    heading: EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE,
    inputLabel: EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE,
    initialPublishedHtml: '<p>Опублікований <strong>опис</strong></p>',
    maxLength: EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.PAGE_DESCRIPTION,
    mode: 'view',
    onEnterEditMode: jest.fn(),
    onDraftChange: jest.fn(),
    onCancelEdit: jest.fn(),
    onPublish: jest.fn(),
    placeholder: EVENTS_TEXT.PAGE_CONTENT.PLACEHOLDER.PAGE_DESCRIPTION,
};

const renderSection = (props: Partial<EditableHeaderSectionProps> = {}) =>
    render(<EditableHeaderSection {...defaultProps} {...props} />);

const TwoSections = () => {
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

    return (
        <>
            <EditableHeaderSection
                {...defaultProps}
                sectionId={EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID}
                heading={EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE}
                inputLabel={EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE}
                initialPublishedHtml={TEST_EVENTS_INTRO_CONTENT.pageDescription}
                mode={editingSectionId === EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID ? 'edit' : 'view'}
                onEnterEditMode={() => setEditingSectionId(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID)}
            />
            <EditableHeaderSection
                {...defaultProps}
                sectionId={EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID}
                heading={EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE}
                inputLabel={EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE}
                initialPublishedHtml={TEST_EVENTS_INTRO_CONTENT.eventsBlockTitle}
                maxLength={EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.EVENTS_BLOCK_TITLE}
                mode={editingSectionId === EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID ? 'edit' : 'view'}
                onEnterEditMode={() => setEditingSectionId(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID)}
            />
        </>
    );
};

describe('EditableHeaderSection', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renders published HTML and edit and view controls in view mode', () => {
        renderSection();

        expect(screen.getByText('Опублікований')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /редагувати секцію/i })).toHaveAttribute('type', 'button');
        expect(screen.getByRole('button', { name: /переглянути секцію/i })).toHaveAttribute('type', 'button');
        expect(screen.queryByLabelText(defaultProps.inputLabel)).not.toBeInTheDocument();
    });

    it('renders the complete long description in view mode', () => {
        const longDescription =
            'Довгий опис подій для перевірки відображення всього тексту без прихованої частини у режимі перегляду.';

        renderSection({ initialPublishedHtml: `<p>${longDescription}</p>` });

        expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('shows both supplied sections and makes only the selected section editable', () => {
        render(<TwoSections />);

        expect(screen.getByText('Тестовий заголовок')).toBeInTheDocument();
        expect(screen.getByText('Тестовий опис подій')).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole('button', {
                name: `${EVENTS_TEXT.PAGE_CONTENT.ARIA_LABEL.EDIT_SECTION}: ${EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE}`,
            }),
        );

        expect(screen.getByLabelText(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE)).toBeInTheDocument();
        expect(
            screen.queryByLabelText(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE),
        ).not.toBeInTheDocument();
        expect(screen.getByText('Тестовий заголовок')).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole('button', {
                name: `${EVENTS_TEXT.PAGE_CONTENT.ARIA_LABEL.EDIT_SECTION}: ${EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE}`,
            }),
        );

        expect(
            screen.queryByLabelText(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE),
        ).not.toBeInTheDocument();
        expect(screen.getByLabelText(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(/\/100$/)).toBeInTheDocument();
    });

    it('renders the rich text input with the supplied HTML and character limit only in edit mode', () => {
        renderSection({ mode: 'edit', maxLength: 100 });

        expect(screen.getByTestId('rich-text-value')).toHaveTextContent(defaultProps.initialPublishedHtml);
        expect(screen.getByTestId('rich-text-value')).not.toHaveAttribute('data-hide-toolbar');
        expect(screen.getByText(/\/100$/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL })).toBeEnabled();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL })).toHaveAttribute('type', 'button');
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toHaveAttribute(
            'type',
            'button',
        );

        fireEvent.change(screen.getByLabelText(defaultProps.inputLabel), { target: { value: 'Оновлений опис' } });
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();

        fireEvent.change(screen.getByLabelText(defaultProps.inputLabel), { target: { value: '' } });
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('enters edit mode through the edit control and cancels without publishing', () => {
        renderSection();

        fireEvent.click(screen.getByRole('button', { name: /редагувати секцію/i }));
        expect(defaultProps.onEnterEditMode).toHaveBeenCalledTimes(1);

        renderSection({ mode: 'edit' });
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));
        expect(defaultProps.onCancelEdit).toHaveBeenCalledTimes(1);
    });

    it('cancels immediately without opening a confirmation modal when the draft has not changed', () => {
        renderSection({ mode: 'edit' });

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));

        expect(defaultProps.onCancelEdit).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
        expect(screen.getByLabelText(defaultProps.inputLabel)).toHaveValue('Опублікований опис');
    });

    it('confirms cancelling a changed draft', () => {
        renderSection({ mode: 'edit' });

        fireEvent.change(screen.getByLabelText(defaultProps.inputLabel), { target: { value: 'Оновлений опис' } });
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));

        expect(
            screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE, {
                normalizer: getDefaultNormalizer({ collapseWhitespace: false }),
            }),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO }));
        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
        expect(screen.getByLabelText(defaultProps.inputLabel)).toHaveValue('Оновлений опис');
        expect(defaultProps.onCancelEdit).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));
        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
        expect(defaultProps.onCancelEdit).toHaveBeenCalledTimes(1);
    });

    it('calls the publish callback with the normalized draft after the value changes', () => {
        const onPublish = jest.fn();
        renderSection({ mode: 'edit', onPublish });

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        fireEvent.change(screen.getByLabelText(defaultProps.inputLabel), { target: { value: 'Оновлений опис   ' } });
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }));

        expect(onPublish).toHaveBeenCalledWith('<p>Оновлений опис</p>');
    });

    it('normalizes leading and repeated whitespace in local draft changes', () => {
        renderSection({ mode: 'edit' });

        fireEvent.change(screen.getByLabelText(defaultProps.inputLabel), { target: { value: '  Один   два ' } });
        expect(defaultProps.onDraftChange).toHaveBeenLastCalledWith('<p>Один два </p>');
        expect(screen.getByText('9/1000')).toBeInTheDocument();
    });

    it('trims both sides on blur and treats whitespace-only content as empty', () => {
        const { rerender } = renderSection({ mode: 'edit' });
        const input = screen.getByLabelText(defaultProps.inputLabel);

        fireEvent.change(input, { target: { value: '  Текст  ' } });
        fireEvent.blur(input);
        expect(defaultProps.onDraftChange).toHaveBeenLastCalledWith('<p>Текст</p>');

        rerender(<EditableHeaderSection {...defaultProps} mode="edit" initialPublishedHtml="<p> </p>" />);
        fireEvent.change(screen.getByLabelText(defaultProps.inputLabel), { target: { value: '   ' } });
        expect(defaultProps.onDraftChange).toHaveBeenLastCalledWith('');
    });

    it('shows the cleanup control only while focused with content and clears this draft', () => {
        renderSection({ mode: 'edit' });
        const input = screen.getByLabelText(defaultProps.inputLabel);

        expect(screen.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();
        fireEvent.focus(input);
        const clearButton = screen.getByRole('button', { name: 'Clear input' });
        expect(clearButton).toHaveAttribute('type', 'button');
        fireEvent.click(clearButton);
        expect(defaultProps.onDraftChange).toHaveBeenLastCalledWith('');
    });
});

describe('normalizeEventsDraftHtml', () => {
    it('preserves allowed markup while normalizing visible text', () => {
        expect(normalizeEventsDraftHtml('<p>  Один <strong>  два</strong>  </p>', true)).toBe(
            '<p>Один <strong> два</strong></p>',
        );
    });
});
