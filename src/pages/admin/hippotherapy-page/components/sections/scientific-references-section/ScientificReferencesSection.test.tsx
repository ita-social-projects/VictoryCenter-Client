import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScientificReferencesSection, ScientificReferencesSectionProps } from './ScientificReferencesSection';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { HippotherapyScientificReferencesSectionContent } from '@/types/admin/hippotherapy-page';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: ({ label, onChange, onBlur, value, id, disabled, error }: any) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <input
                data-testid={`mock-rich-input-${id}`}
                onChange={(e) => !disabled && onChange(e.target.value)}
                onBlur={() => !disabled && onBlur?.()}
                value={value}
                id={id}
                disabled={disabled}
            />
            {error && <span>{error}</span>}
        </div>
    ),
}));

jest.mock('./scientific-reference-card/ScientificReferenceCard', () => ({
    ScientificReferenceCard: ({
                                  localId,
                                  name,
                                  url,
                                  autoFocus,
                                  canDelete,
                                  nameError,
                                  urlError,
                                  disabled,
                                  isExpanded,
                                  onToggleExpand,
                                  onNameChange,
                                  onUrlChange,
                                  onNameBlur,
                                  onUrlBlur,
                              }: any) => (
        <div
            data-testid={`reference-card-${localId}`}
            data-auto-focus={autoFocus}
            data-can-delete={canDelete}
            data-is-expanded={isExpanded}
        >
            <button data-testid={`toggle-expand-${localId}`} onClick={() => onToggleExpand(localId)} />
            <button data-testid={`toggle-unknown-${localId}`} onClick={() => onToggleExpand('unknown-local-id')} />
            <input
                data-testid={`name-input-${localId}`}
                value={name}
                disabled={disabled}
                onChange={(e) => onNameChange(localId, e.target.value)}
                onBlur={() => onNameBlur(localId)}
            />
            {nameError && <span>{nameError}</span>}
            <input
                data-testid={`url-input-${localId}`}
                value={url}
                disabled={disabled}
                onChange={(e) => onUrlChange(localId, e.target.value)}
                onBlur={() => onUrlBlur(localId)}
            />
            {urlError && <span>{urlError}</span>}
        </div>
    ),
}));

describe('ScientificReferencesSection', () => {
    let mockOnChange: jest.Mock;

    const defaultValue: HippotherapyScientificReferencesSectionContent = {
        title: 'Research title',
        description: 'Research description',
        scientificReferences: [
            { localId: 'ref-1', id: 1, name: 'Citation one', url: 'https://example.com/one' },
            { localId: 'ref-2', id: 2, name: 'Citation two', url: 'https://example.com/two' },
        ],
    };

    const renderComponent = (props: Partial<ScientificReferencesSectionProps> = {}) =>
        render(<ScientificReferencesSection value={defaultValue} onChange={mockOnChange} {...props} />);

    const getAddButton = () =>
        screen.getByRole('button', { name: new RegExp(HIPPOTHERAPY_PAGE_TEXT.BUTTON.ADD_REFERENCE) });

    beforeEach(() => {
        mockOnChange = jest.fn();

        if (!(global as any).crypto) {
            Object.defineProperty(global, 'crypto', { value: {}, configurable: true, writable: true });
        }
        (global as any).crypto.randomUUID = jest.fn(() => 'generated-uuid');
    });

    it('renders all references collapsed by default', () => {
        renderComponent();

        expect(screen.getByTestId('reference-card-ref-1')).toHaveAttribute('data-is-expanded', 'false');
        expect(screen.getByTestId('reference-card-ref-2')).toHaveAttribute('data-is-expanded', 'false');
    });

    it('expands and collapses a reference when its toggle is clicked', () => {
        renderComponent();

        fireEvent.click(screen.getByTestId('toggle-expand-ref-1'));

        expect(screen.getByTestId('reference-card-ref-1')).toHaveAttribute('data-is-expanded', 'true');

        fireEvent.click(screen.getByTestId('toggle-expand-ref-1'));

        expect(screen.getByTestId('reference-card-ref-1')).toHaveAttribute('data-is-expanded', 'false');
    });

    it('keeps several references expanded at the same time', () => {
        renderComponent();

        fireEvent.click(screen.getByTestId('toggle-expand-ref-1'));
        fireEvent.click(screen.getByTestId('toggle-expand-ref-2'));

        expect(screen.getByTestId('reference-card-ref-1')).toHaveAttribute('data-is-expanded', 'true');
        expect(screen.getByTestId('reference-card-ref-2')).toHaveAttribute('data-is-expanded', 'true');
    });

    it('keeps a reference expanded when its localId is regenerated after saving', () => {
        const { rerender } = renderComponent();

        fireEvent.click(screen.getByTestId('toggle-expand-ref-1'));
        expect(screen.getByTestId('reference-card-ref-1')).toHaveAttribute('data-is-expanded', 'true');

        const reloadedValue: HippotherapyScientificReferencesSectionContent = {
            ...defaultValue,
            scientificReferences: [
                { localId: 'regenerated-1', id: 1, name: 'Citation one', url: 'https://example.com/one' },
                { localId: 'regenerated-2', id: 2, name: 'Citation two', url: 'https://example.com/two' },
            ],
        };

        rerender(<ScientificReferencesSection value={reloadedValue} onChange={mockOnChange} />);

        expect(screen.getByTestId('reference-card-regenerated-1')).toHaveAttribute('data-is-expanded', 'true');
    });

    it('renders the title, description, and one card per reference', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByTestId('reference-card-ref-1')).toBeInTheDocument();
        expect(screen.getByTestId('reference-card-ref-2')).toBeInTheDocument();
    });

    it('calls onChange with the updated title', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-scientific-references-title'), {
            target: { value: 'New title' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, title: 'New title' });
    });

    it('calls onChange with the updated description', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-scientific-references-description'), {
            target: { value: 'New description' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, description: 'New description' });
    });

    it('hides delete on every card once only one reference remains', () => {
        renderComponent({ value: { ...defaultValue, scientificReferences: [defaultValue.scientificReferences[0]] } });

        expect(screen.getByTestId('reference-card-ref-1')).toHaveAttribute('data-can-delete', 'false');
    });

    it('updates only the targeted reference name', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('name-input-ref-2'), { target: { value: 'Updated citation two' } });

        expect(mockOnChange).toHaveBeenCalledWith({
            ...defaultValue,
            scientificReferences: [
                defaultValue.scientificReferences[0],
                { ...defaultValue.scientificReferences[1], name: 'Updated citation two' },
            ],
        });
    });

    it('updates only the targeted reference url', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('url-input-ref-2'), { target: { value: 'https://example.com/updated' } });

        expect(mockOnChange).toHaveBeenCalledWith({
            ...defaultValue,
            scientificReferences: [
                defaultValue.scientificReferences[0],
                { ...defaultValue.scientificReferences[1], url: 'https://example.com/updated' },
            ],
        });
    });

    it('disables the add button while saving', () => {
        renderComponent({ disabled: true });

        expect(getAddButton()).toBeDisabled();
    });

    it('shows no error on blur when the name and url are already valid', () => {
        renderComponent();

        fireEvent.blur(screen.getByTestId('name-input-ref-1'));
        fireEvent.blur(screen.getByTestId('url-input-ref-1'));

        expect(screen.getByTestId('reference-card-ref-1')).not.toHaveTextContent(
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        );
    });

    it('shows an error on blur when the name or url is invalid', () => {
        renderComponent({
            value: {
                ...defaultValue,
                scientificReferences: [{ localId: 'ref-1', id: 1, name: '', url: '' }],
            },
        });

        fireEvent.blur(screen.getByTestId('name-input-ref-1'));
        fireEvent.blur(screen.getByTestId('url-input-ref-1'));

        const errors = screen.getAllByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED);
        expect(errors).toHaveLength(2);
    });

    it('re-validates the name and url as soon as they change once an error has already been shown', () => {
        renderComponent({
            value: {
                ...defaultValue,
                scientificReferences: [{ localId: 'ref-1', id: 1, name: '', url: '' }],
            },
        });

        fireEvent.blur(screen.getByTestId('name-input-ref-1'));
        fireEvent.blur(screen.getByTestId('url-input-ref-1'));
        expect(screen.getAllByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toHaveLength(2);

        fireEvent.change(screen.getByTestId('name-input-ref-1'), { target: { value: 'Fixed name' } });
        fireEvent.change(screen.getByTestId('url-input-ref-1'), { target: { value: 'https://example.com/fixed' } });

        expect(screen.queryByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).not.toBeInTheDocument();
    });

    it('shows a title error on blur', () => {
        renderComponent({ value: { ...defaultValue, title: '' } });

        fireEvent.blur(screen.getByTestId('mock-rich-input-scientific-references-title'));

        expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
    });

    it('shows a description error on blur', () => {
        renderComponent({ value: { ...defaultValue, description: '' } });

        fireEvent.blur(screen.getByTestId('mock-rich-input-scientific-references-description'));

        expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
    });

    it('adds a new empty reference at the end of the list when the add button is clicked', () => {
        renderComponent();

        fireEvent.click(getAddButton());

        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({
                scientificReferences: [
                    ...defaultValue.scientificReferences,
                    expect.objectContaining({ localId: 'generated-uuid', id: null, name: '', url: '' }),
                ],
            }),
        );
    });

    it('disables the add button while a reference is incomplete', () => {
        renderComponent({
            value: {
                ...defaultValue,
                scientificReferences: [{ localId: 'ref-1', id: 1, name: '', url: '' }],
            },
        });

        expect(getAddButton()).toBeDisabled();
    });

    it('enables the add button when every reference is filled in', () => {
        renderComponent();

        expect(getAddButton()).toBeEnabled();
    });

    it('ignores a toggle for a reference that is no longer in the list', () => {
        renderComponent();

        fireEvent.click(screen.getByTestId('toggle-unknown-ref-1'));

        expect(screen.getByTestId('reference-card-ref-1')).toHaveAttribute('data-is-expanded', 'false');
        expect(screen.getByTestId('reference-card-ref-2')).toHaveAttribute('data-is-expanded', 'false');
    });

    it('validates the trimmed name on blur', () => {
        renderComponent({
            value: {
                ...defaultValue,
                scientificReferences: [{ localId: 'ref-1', id: 1, name: 'ab ', url: 'https://example.com/one' }],
            },
        });

        fireEvent.blur(screen.getByTestId('name-input-ref-1'));

        expect(
            screen.getByText(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(HIPPOTHERAPY_PAGE_TEXT.MIN_REFERENCE_NAME_LENGTH),
            ),
        ).toBeInTheDocument();
    });

    it('keeps the add button disabled when a value only passes validation thanks to trailing spaces', () => {
        renderComponent({
            value: {
                ...defaultValue,
                scientificReferences: [
                    { localId: 'ref-1', id: 1, name: 'ab         ', url: 'https://example.com/one' },
                ],
            },
        });

        expect(getAddButton()).toBeDisabled();
    });
});