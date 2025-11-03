import React, { createRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TranslateMemberForm, TranslateTeamMemberFormRef, TranslateTeamMemberFormValues } from './TranslateMemberForm';
import { TEAM_MEMBER_VALIDATION, TEAM_MEMBERS_TEXT } from '../../../../../../const/admin/team';
import { VisibilityStatus } from '../../../../../../types/admin/common';

describe('TranslateMemberForm', () => {
    it('reports validation state via onValidationChange and becomes valid after fields set', async () => {
        const onSubmit = jest.fn();
        const onValidationChange = jest.fn();
        const ref = createRef<TranslateTeamMemberFormRef>();

        render(<TranslateMemberForm ref={ref} onSubmit={onSubmit} onValidationChange={onValidationChange} />);

        // Initially invalid
        expect(onValidationChange).toHaveBeenLastCalledWith(false);

        // Fill full name
        const fullNameInput = screen.getByLabelText(new RegExp(TEAM_MEMBERS_TEXT.FORM.LABEL.FULLNAME));
        fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
        fireEvent.blur(fullNameInput);

        // Fill valid description
        const descriptionInput = screen.getByLabelText(TEAM_MEMBERS_TEXT.FORM.LABEL.DESCRIPTION);
        fireEvent.change(descriptionInput, { target: { value: 'Valid description text' } });
        fireEvent.blur(descriptionInput);

        // Should now be valid
        await waitFor(() => {
            expect(onValidationChange).toHaveBeenLastCalledWith(true);
        });
    });

    it('shows validation errors on blur for invalid full name', () => {
        const onSubmit = jest.fn();
        const ref = createRef<TranslateTeamMemberFormRef>();

        render(<TranslateMemberForm ref={ref} onSubmit={onSubmit} />);

        const fullNameInput = screen.getByLabelText(new RegExp(TEAM_MEMBERS_TEXT.FORM.LABEL.FULLNAME));
        fireEvent.change(fullNameInput, { target: { value: '123' } });
        fireEvent.blur(fullNameInput);

        expect(screen.getByText(TEAM_MEMBER_VALIDATION.fullName.getPatternError())).toBeInTheDocument();
    });

    it('blocks submit when invalid', async () => {
        const onSubmit = jest.fn();
        const ref = createRef<TranslateTeamMemberFormRef>();

        render(<TranslateMemberForm ref={ref} onSubmit={onSubmit} />);

        // Fill only full name, description invalid
        fireEvent.change(screen.getByLabelText(new RegExp(TEAM_MEMBERS_TEXT.FORM.LABEL.FULLNAME)), {
            target: { value: 'Alex Doe' },
        });

        await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    });

    it('calls onSubmit when all fields valid', async () => {
        const onSubmit = jest.fn();
        const ref = createRef<TranslateTeamMemberFormRef>();

        render(<TranslateMemberForm ref={ref} onSubmit={onSubmit} />);

        // Fill fields
        fireEvent.change(screen.getByLabelText(new RegExp(TEAM_MEMBERS_TEXT.FORM.LABEL.FULLNAME)), {
            target: { value: 'Jane Doe' },
        });
        fireEvent.change(screen.getByLabelText(TEAM_MEMBERS_TEXT.FORM.LABEL.DESCRIPTION), {
            target: { value: 'A valid translation text' },
        });

        ref.current?.submit(VisibilityStatus.Published);
        await waitFor(() =>
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ fullName: 'Jane Doe', description: 'A valid translation text' }),
                VisibilityStatus.Published,
            ),
        );
    });

    it('isDirty tracks changes and resets on initialData change', () => {
        const onSubmit = jest.fn();
        const ref = createRef<TranslateTeamMemberFormRef>();

        const { rerender } = render(<TranslateMemberForm ref={ref} onSubmit={onSubmit} />);

        expect(ref.current?.isDirty()).toBe(false);

        fireEvent.change(screen.getByLabelText(new RegExp(TEAM_MEMBERS_TEXT.FORM.LABEL.FULLNAME)), {
            target: { value: 'Changed' },
        });
        expect(ref.current?.isDirty()).toBe(true);

        const initialData: TranslateTeamMemberFormValues = {
            fullName: 'Preset',
            description: 'Some desc',
        };

        rerender(<TranslateMemberForm ref={ref} onSubmit={onSubmit} initialData={initialData} />);
        expect(ref.current?.isDirty()).toBe(false);
    });
});
