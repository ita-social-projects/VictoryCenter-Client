import React, { createRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemberForm, TeamMemberFormRef, TeamMemberFormValues } from './MemberForm';
import { TEAM_MEMBER_VALIDATION, TEAM_MEMBERS_TEXT } from '@const/admin/team';
import { VisibilityStatus } from '@app-types/admin/common';
import { TeamCategory } from '@app-types/admin/team-category';

jest.mock('@components/common/single-select-input/SingleSelectInput', () => ({
    SingleSelectInput: ({ options, value, onChange, placeholder, getOptionId, getOptionName, disabled }: any) => {
        return (
            <select
                data-testid="category-select"
                value={value ? getOptionId(value) : ''}
                onChange={(e) => {
                    const selected = options.find((o: any) => String(getOptionId(o)) === e.target.value);
                    onChange?.(selected);
                }}
                disabled={disabled}
                aria-label={placeholder}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {options.map((o: any) => (
                    <option key={getOptionId(o)} value={getOptionId(o)}>
                        {getOptionName(o)}
                    </option>
                ))}
            </select>
        );
    },
}));

jest.mock('@components/admin/image-input/ImageInput', () => ({
    ImageInput: ({ onChange, disabled }: any) => (
        <div>
            <button
                type="button"
                data-testid="set-image"
                disabled={disabled}
                onClick={() => onChange?.({ base64: 'abc', mimeType: 'image/png', size: 1024 })}
            >
                set image
            </button>
        </div>
    ),
}));

const categories: TeamCategory[] = [
    { id: 1, name: 'Coaches', description: '', teamMembersCount: 0 },
    { id: 2, name: 'Volunteers', description: '', teamMembersCount: 0 },
];

describe('MemberForm', () => {
    it('reports validation state via onValidationChange and becomes valid after required fields set', async () => {
        const onSubmit = jest.fn();
        const onValidationChange = jest.fn();
        const ref = createRef<TeamMemberFormRef>();

        render(
            <MemberForm
                ref={ref}
                categories={categories}
                onSubmit={onSubmit}
                onValidationChange={onValidationChange}
            />,
        );

        // Initially invalid
        expect(onValidationChange).toHaveBeenLastCalledWith(false);

        // Select category
        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '1' } });

        // Fill full name
        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
        fireEvent.blur(fullNameInput);

        // Fill description with valid length (10+ chars)
        const descriptionInput = screen.getByLabelText(/Опис/);
        fireEvent.change(descriptionInput, { target: { value: 'Valid description text' } });
        fireEvent.blur(descriptionInput);

        // Now valid for draft
        await waitFor(() => {
            expect(onValidationChange).toHaveBeenLastCalledWith(true);
        });
    });

    it('shows validation errors on blur for invalid full name', () => {
        const onSubmit = jest.fn();
        const ref = createRef<TeamMemberFormRef>();

        render(<MemberForm ref={ref} categories={categories} onSubmit={onSubmit} />);

        const fullNameInput = screen.getByLabelText(/Ім'я та Прізвище/);
        fireEvent.change(fullNameInput, { target: { value: '123' } });
        fireEvent.blur(fullNameInput);

        expect(screen.getByText(TEAM_MEMBER_VALIDATION.fullName.getPatternError())).toBeInTheDocument();
    });

    it('submit: calls onSubmit for Draft when valid, but blocks Published without image/description', async () => {
        const onSubmit = jest.fn();
        const ref = createRef<TeamMemberFormRef>();

        render(<MemberForm ref={ref} categories={categories} onSubmit={onSubmit} />);

        // Valid minimal for draft
        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Ім'я та Прізвище/), {
            target: { value: 'Jane Doe' },
        });

        // Add valid description for draft
        fireEvent.change(screen.getByLabelText(/Опис/), {
            target: { value: 'Valid description text' },
        });

        // Draft submit OK
        ref.current?.submit(VisibilityStatus.Draft);
        await waitFor(() => expect(onSubmit).toHaveBeenCalled());

        onSubmit.mockClear();

        // Publish submit blocked because image required
        ref.current?.submit(VisibilityStatus.Published);
        await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    });

    it('submit: Published succeeds when image and min description provided', async () => {
        const onSubmit = jest.fn();
        const ref = createRef<TeamMemberFormRef>();

        render(<MemberForm ref={ref} categories={categories} onSubmit={onSubmit} />);

        // Fill required fields
        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '2' } });
        fireEvent.change(screen.getByLabelText(/Ім'я та Прізвище/), {
            target: { value: 'Alex Doe' },
        });

        // Description minimum length (10)
        fireEvent.change(screen.getByLabelText(TEAM_MEMBERS_TEXT.FORM.LABEL.DESCRIPTION), {
            target: { value: 'abcdefghij' },
        });

        // Set image via mock
        fireEvent.click(screen.getByTestId('set-image'));

        ref.current?.submit(VisibilityStatus.Published);

        await waitFor(() =>
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ fullName: 'Alex Doe', categoryId: 2 }),
                VisibilityStatus.Published,
            ),
        );
    });

    it('isDirty tracks changes and resets on initialData change', () => {
        const onSubmit = jest.fn();
        const ref = createRef<TeamMemberFormRef>();

        const { rerender } = render(<MemberForm ref={ref} categories={categories} onSubmit={onSubmit} />);

        expect(ref.current?.isDirty()).toBe(false);

        fireEvent.change(screen.getByLabelText(/Ім'я та Прізвище/), {
            target: { value: 'Changed' },
        });
        expect(ref.current?.isDirty()).toBe(true);

        const initialData: TeamMemberFormValues = {
            fullName: 'Preset',
            description: '',
            categoryId: 1,
            image: null,
            imageId: null,
        };

        rerender(<MemberForm ref={ref} categories={categories} onSubmit={onSubmit} initialData={initialData} />);
        expect(ref.current?.isDirty()).toBe(false);
    });
});
