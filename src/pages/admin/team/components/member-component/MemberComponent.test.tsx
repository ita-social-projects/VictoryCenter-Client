import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemberComponent, MemberComponentProps } from './MemberComponent';
import '@testing-library/jest-dom';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { mapImageToBase64 } from '../../../../../utils/functions/map-image-to-base-64/map-image-to-base-64';

jest.mock('../../../../../utils/functions/map-image-to-base-64/map-image-to-base-64', () => ({
    mapImageToBase64: jest.fn(),
}));

jest.mock('../../../../../assets/icons/blank-user.svg', () => 'blank-user.svg');

jest.mock('../../../../../components/admin/visibility-status-label/VisibilityStatusLabel', () => ({
    VisibilityStatusLabel: ({ status }: { status: VisibilityStatus }) => (
        <div data-testid="visibility-label">{`Status: ${status}`}</div>
    ),
}));

const baseMember = {
    id: 1,
    image: { id: 10, base64: 'base64string', mimeType: 'image/png', size: 1234 },
    fullName: 'John Doe',
    description: 'Frontend Developer',
    status: VisibilityStatus.Published,
    categoryId: 5,
};

describe('MemberComponent', () => {
    let handleOnEditMember: jest.Mock;
    let handleOnDeleteMember: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        handleOnEditMember = jest.fn();
        handleOnDeleteMember = jest.fn();
    });

    const renderComponent = (override: Partial<MemberComponentProps['member']> = {}) =>
        render(
            <MemberComponent
                member={{ ...baseMember, ...override }}
                handleOnEditMember={handleOnEditMember}
                handleOnDeleteMember={handleOnDeleteMember}
            />,
        );

    it('renders with base64 image from mapImageToBase64', () => {
        (mapImageToBase64 as jest.Mock).mockReturnValue('data:image/png;base64,abc123');

        renderComponent();

        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', 'data:image/png;base64,abc123');
        expect(img).toHaveAttribute('alt', `${TEAM_MEMBERS_TEXT.FORM.LABEL.PHOTO}-John Doe`);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Frontend Developer')).toBeInTheDocument();

        // VisibilityStatusLabel mock should render with status
        expect(screen.getByTestId('visibility-label')).toHaveTextContent(`Status: ${VisibilityStatus.Published}`);
    });

    it('falls back to BlankUserImage when mapImageToBase64 returns null', () => {
        (mapImageToBase64 as jest.Mock).mockReturnValue(null);

        renderComponent({ image: null });

        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', 'blank-user.svg');
    });

    it('calls handleOnEditMember when edit button clicked', () => {
        (mapImageToBase64 as jest.Mock).mockReturnValue('img123');

        renderComponent();
        const editBtn = screen.getByRole('button', { name: TEAM_MEMBERS_TEXT.ACTIONS.EDIT }); // no visible text, so fallback query
        fireEvent.click(editBtn); // first button in DOM is edit
        expect(handleOnEditMember).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });

    it('calls handleOnDeleteMember when delete button clicked', () => {
        (mapImageToBase64 as jest.Mock).mockReturnValue('img123');

        renderComponent();
        const deleteBtn = screen.getByRole('button', { name: TEAM_MEMBERS_TEXT.ACTIONS.DELETE });
        fireEvent.click(deleteBtn);
        expect(handleOnDeleteMember).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });
});
