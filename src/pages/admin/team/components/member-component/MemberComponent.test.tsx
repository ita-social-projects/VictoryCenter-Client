import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemberComponent } from './MemberComponent';
import { Member } from '../../../../../types/admin/TeamMembers';

const mockMemberDraft: Member = {
    id: 1,
    fullName: 'John Doe',
    description: 'Software Engineer',
    img: 'https://example.com/john.jpg',
    status: 'Чернетка',
    category: 'Основна команда',
};

const mockMemberPublished: Member = {
    id: 2,
    fullName: 'Jane Smith',
    description: 'Product Manager',
    img: 'https://example.com/jane.jpg',
    status: 'Опубліковано',
    category: 'Наглядова рада',
};

const mockHandleOnDeleteMember = jest.fn();
const mockHandleOnEditMember = jest.fn();

jest.mock('../../../../../assets/images/admin/blank-user.svg', () => 'blank-user.svg');

describe('MemberComponent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        test('renders member component with all required elements', () => {
            render(
                <MemberComponent
                    member={mockMemberDraft}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            expect(screen.getByRole('img')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Software Engineer')).toBeInTheDocument();
            expect(screen.getByText('Чернетка')).toBeInTheDocument();
        });

        test('renders member image with correct src and alt attributes', () => {
            render(
                <MemberComponent
                    member={mockMemberDraft}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            const image = screen.getByRole('img');
            expect(image).toHaveAttribute('src', 'https://example.com/john.jpg');
            expect(image).toHaveAttribute('alt', 'John Doe-img');
        });

        test('renders member fullName correctly', () => {
            render(
                <MemberComponent
                    member={mockMemberPublished}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        test('renders member description correctly', () => {
            render(
                <MemberComponent
                    member={mockMemberPublished}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            expect(screen.getByText('Product Manager')).toBeInTheDocument();
        });
    });

    describe('Status styling', () => {
        test('applies draft status class when status is "Чернетка"', () => {
            render(
                <MemberComponent
                    member={mockMemberDraft}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            const statusElement = screen.getByText('Чернетка').closest('div');
            expect(statusElement).toHaveClass('members-status');
            expect(statusElement).toHaveClass('members-status-draft');
            expect(statusElement).not.toHaveClass('members-status-published');
        });

        test('applies published status class when status is not "Чернетка"', () => {
            render(
                <MemberComponent
                    member={mockMemberPublished}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            const statusElement = screen.getByText('Опубліковано').closest('div');
            expect(statusElement).toHaveClass('members-status');
            expect(statusElement).toHaveClass('members-status-published');
            expect(statusElement).not.toHaveClass('members-status-draft');
        });

        test('renders status indicator bullet point', () => {
            render(
                <MemberComponent
                    member={mockMemberDraft}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            expect(screen.getByText('•')).toBeInTheDocument();
        });
    });

    describe('Event handlers', () => {
        test('calls handleOnEditMember with correct id when edit button is clicked', () => {
            const { container } = render(
                <MemberComponent
                    member={mockMemberDraft}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            const editButton = container.querySelector('.members-actions-edit');
            if (!editButton) throw new Error();
            fireEvent.click(editButton);

            expect(mockHandleOnEditMember).toHaveBeenCalledTimes(1);
            expect(mockHandleOnEditMember).toHaveBeenCalledWith(1);
        });

        test('calls handleOnDeleteMember with correct fullName when delete button is clicked', () => {
            const { container } = render(
                <MemberComponent
                    member={mockMemberPublished}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            const deleteButton = container.querySelector('.members-actions-delete');
            if (!deleteButton) throw new Error();
            fireEvent.click(deleteButton);

            expect(mockHandleOnDeleteMember).toHaveBeenCalledTimes(1);
            expect(mockHandleOnDeleteMember).toHaveBeenCalledWith('Jane Smith');
        });

        test('does not call handlers when component is just rendered', () => {
            render(
                <MemberComponent
                    member={mockMemberDraft}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            expect(mockHandleOnEditMember).not.toHaveBeenCalled();
            expect(mockHandleOnDeleteMember).not.toHaveBeenCalled();
        });
    });

    describe('CSS Classes', () => {
        test('applies correct CSS classes to container elements', () => {
            const { container } = render(
                <MemberComponent
                    member={mockMemberDraft}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            expect(container.querySelector('.members-item')).toBeInTheDocument();
            expect(container.querySelector('.members-profile')).toBeInTheDocument();
            expect(container.querySelector('.members-position')).toBeInTheDocument();
            expect(container.querySelector('.members-controls')).toBeInTheDocument();
            expect(container.querySelector('.members-actions')).toBeInTheDocument();
            expect(container.querySelector('.members-actions-edit')).toBeInTheDocument();
            expect(container.querySelector('.members-actions-delete')).toBeInTheDocument();
        });
    });

    describe('Edge cases', () => {
        test('handles empty string values gracefully', () => {
            const emptyMember: Member = {
                id: 3,
                fullName: '',
                description: '',
                img: '',
                status: 'Чернетка',
                category: 'Радники',
            };

            render(
                <MemberComponent
                    member={emptyMember}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            const image = screen.getByRole('img');
            const srcAttribute = image.getAttribute('src');
            expect(srcAttribute).toBe('blank-user.svg');
            expect(image).toHaveAttribute('alt', '-img');
        });

        test('handles special characters in member data', () => {
            const specialMember: Member = {
                id: 4,
                fullName: 'José María Ñoño',
                description: 'Designer & Developer',
                img: 'https://example.com/josé.jpg',
                status: 'Чернетка',
                category: 'Основна команда',
            };

            render(
                <MemberComponent
                    member={specialMember}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            expect(screen.getByText('José María Ñoño')).toBeInTheDocument();
            expect(screen.getByText('Designer & Developer')).toBeInTheDocument();
        });

        test('handles different status values correctly', () => {
            const customStatusMember: Member = {
                id: 5,
                fullName: 'Test User',
                description: 'Tester',
                img: 'test.jpg',
                status: 'Custom Status',
                category: 'Наглядова рада',
            };

            render(
                <MemberComponent
                    member={customStatusMember}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            const statusElement = screen.getByText('Custom Status').closest('div');
            expect(statusElement).toHaveClass('members-status-published');
            expect(statusElement).not.toHaveClass('members-status-draft');
        });
    });

    describe('Props validation', () => {
        test('component receives and uses all required props', () => {
            const testMember: Member = {
                id: 6,
                fullName: 'Props Test',
                description: 'Testing props',
                img: 'props.jpg',
                status: 'Чернетка',
                category: 'Радники',
            };

            const { container } = render(
                <MemberComponent
                    member={testMember}
                    handleOnDeleteMember={mockHandleOnDeleteMember}
                    handleOnEditMember={mockHandleOnEditMember}
                />,
            );

            expect(screen.getByText('Props Test')).toBeInTheDocument();
            expect(screen.getByText('Testing props')).toBeInTheDocument();
            expect(screen.getByRole('img')).toHaveAttribute('src', 'props.jpg');
            expect(screen.getByText('Чернетка')).toBeInTheDocument();

            const deleteButton = container.querySelector('.members-actions-delete');
            const editButton = container.querySelector('.members-actions-edit');

            if (!deleteButton || !editButton) throw new Error();

            fireEvent.click(editButton);
            fireEvent.click(deleteButton);

            expect(mockHandleOnEditMember).toHaveBeenCalledWith(6);
            expect(mockHandleOnDeleteMember).toHaveBeenCalledWith('Props Test');
        });
    });
});
