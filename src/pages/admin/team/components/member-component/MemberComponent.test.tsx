import { render, screen, fireEvent } from '@testing-library/react';
import { MemberComponent, MemberComponentProps } from './MemberComponent';
import '@testing-library/jest-dom';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';

jest.mock('../../../../../assets/icons/blank-user.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="blank-user-icon" />,
}));

jest.mock('../../../../../components/admin/visibility-status-label/VisibilityStatusLabel', () => ({
    VisibilityStatusLabel: ({ status }: { status: VisibilityStatus }) => (
        <div data-testid="visibility-label">{`Status: ${status}`}</div>
    ),
}));

const baseMember = {
    id: 1,
    image: { id: 10, url: 'base64string', mimeType: 'image/png', size: 1234 },
    fullName: 'John Doe',
    description: 'Frontend Developer',
    status: VisibilityStatus.Published,
    categoryId: 5,
    localizations: [],
};

describe('MemberComponent', () => {
    let handleOnTranslateMember: jest.Mock;
    let handleOnEditMember: jest.Mock;
    let handleOnDeleteMember: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        handleOnTranslateMember = jest.fn();
        handleOnEditMember = jest.fn();
        handleOnDeleteMember = jest.fn();
    });

    const renderComponent = (override: Partial<MemberComponentProps['member']> = {}) =>
        render(
            <MemberComponent
                member={{ ...baseMember, ...override }}
                handleOnTranslateMember={handleOnTranslateMember}
                handleOnEditMember={handleOnEditMember}
                handleOnDeleteMember={handleOnDeleteMember}
            />,
        );

    it('renders valid data', () => {
        renderComponent({
            image: { id: 10, url: 'https://superSecretStorage.com/image.png', mimeType: 'image/png', size: 1234 },
        });

        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', 'https://superSecretStorage.com/image.png');
        expect(img).toHaveAttribute('alt', `${TEAM_MEMBERS_TEXT.FORM.LABEL.PHOTO}-John Doe`);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Frontend Developer')).toBeInTheDocument();

        // VisibilityStatusLabel mock should render with status
        expect(screen.getByTestId('visibility-label')).toHaveTextContent(`Status: ${VisibilityStatus.Published}`);
    });

    it('falls back to BlankUserImage when image value is null', () => {
        renderComponent({ image: null });

        expect(screen.getByTestId('blank-user-icon')).toBeInTheDocument();
    });

    it('calls handleOnEditMember when edit button clicked', () => {
        renderComponent();
        const editBtn = screen.getByRole('button', { name: TEAM_MEMBERS_TEXT.ACTIONS.EDIT }); // no visible text, so fallback query
        fireEvent.click(editBtn); // first button in DOM is edit
        expect(handleOnEditMember).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });

    it('calls handleOnDeleteMember when delete button clicked', () => {
        renderComponent();
        const deleteBtn = screen.getByRole('button', { name: TEAM_MEMBERS_TEXT.ACTIONS.DELETE });
        fireEvent.click(deleteBtn);
        expect(handleOnDeleteMember).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });
});
