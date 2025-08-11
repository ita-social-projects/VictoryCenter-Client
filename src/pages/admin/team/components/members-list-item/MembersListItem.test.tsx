import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MembersListItem } from './MembersListItem';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { TeamMember } from '../../../../../types/admin/team-members';

// Mock MemberComponent to isolate test scope
jest.mock('../member-component/MemberComponent', () => ({
    MemberComponent: ({ member, handleOnDeleteMember, handleOnEditMember }: any) => (
        <div data-testid="member-component">
            <div>{member.fullName}</div>
            <button onClick={() => handleOnEditMember(member)}>Edit</button>
            <button onClick={() => handleOnDeleteMember(member)}>Delete</button>
        </div>
    ),
}));

describe('MembersListItem', () => {
    const mockMember: TeamMember = {
        id: 42,
        image: null,
        fullName: 'Jane Doe',
        description: 'Developer',
        status: 1,
        categoryId: 5,
    };

    const baseProps = {
        member: mockMember,
        handleDragOver: jest.fn(),
        handleDragStart: jest.fn(),
        handleDrag: jest.fn(),
        handleDragEnd: jest.fn(),
        handleDrop: jest.fn(),
        handleOnDeleteMember: jest.fn(),
        handleOnEditMember: jest.fn(),
        id: 42,
        draggedId: null,
    };

    it('renders correctly with MemberComponent and drag icon', () => {
        render(<MembersListItem {...baseProps} />);
        expect(screen.getByTestId('member-component')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Змінити порядок елемента/i })).toBeInTheDocument();
        expect(screen.getByAltText(TEAM_MEMBERS_TEXT.ACTIONS.REORDER)).toBeInTheDocument();
    });

    it('applies "dragging" class when draggedIndex matches id', () => {
        const { container } = render(<MembersListItem {...baseProps} draggedId={42} />);
        expect(container.firstChild).toHaveClass('dragging');
    });

    it('does not apply "dragging" class when draggedIndex does not match id', () => {
        const { container } = render(<MembersListItem {...baseProps} draggedId={99} />);
        expect(container.firstChild).not.toHaveClass('dragging');
    });

    it('calls handleDragOver on dragOver event', () => {
        const { container } = render(<MembersListItem {...baseProps} />);
        fireEvent.dragOver(container.firstChild!);
        expect(baseProps.handleDragOver).toHaveBeenCalledTimes(1);
    });

    it('calls handleDrop with id on drop event', () => {
        const { container } = render(<MembersListItem {...baseProps} />);
        fireEvent.drop(container.firstChild!);
        expect(baseProps.handleDrop).toHaveBeenCalledWith(baseProps.id);
    });

    it('calls handleDragEnd on dragEnd event on container', () => {
        const { container } = render(<MembersListItem {...baseProps} />);
        fireEvent.dragEnd(container.firstChild!);
        expect(baseProps.handleDragEnd).toHaveBeenCalledTimes(1);
    });

    it('calls handleDragStart with event and id on dragStart of dragger div', () => {
        render(<MembersListItem {...baseProps} />);
        const dragger = screen.getByRole('button', { name: /Змінити порядок елемента/i });
        fireEvent.dragStart(dragger);
        expect(baseProps.handleDragStart).toHaveBeenCalledTimes(1);
        // Check the first arg is event and second arg is id
        const args = baseProps.handleDragStart.mock.calls[0];
        expect(args[1]).toBe(baseProps.id);
    });

    it('calls handleDrag on drag event of dragger div', () => {
        render(<MembersListItem {...baseProps} />);
        const dragger = screen.getByRole('button', { name: /Змінити порядок елемента/i });
        fireEvent.drag(dragger);
        expect(baseProps.handleDrag).toHaveBeenCalledTimes(1);
    });

    it('calls handleDragEnd on dragEnd event of dragger div', () => {
        render(<MembersListItem {...baseProps} />);
        const dragger = screen.getByRole('button', { name: /Змінити порядок елемента/i });
        fireEvent.dragEnd(dragger);
        expect(baseProps.handleDragEnd).toHaveBeenCalledTimes(2);
    });

    it('calls handleOnEditMember and handleOnDeleteMember from MemberComponent', () => {
        render(<MembersListItem {...baseProps} />);
        fireEvent.click(screen.getByText('Edit'));
        expect(baseProps.handleOnEditMember).toHaveBeenCalledWith(mockMember);
        fireEvent.click(screen.getByText('Delete'));
        expect(baseProps.handleOnDeleteMember).toHaveBeenCalledWith(mockMember);
    });
});
