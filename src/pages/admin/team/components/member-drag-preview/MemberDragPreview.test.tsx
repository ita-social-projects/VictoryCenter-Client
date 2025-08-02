import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemberDragPreview } from './MemberDragPreview';
import { Image } from '../../../../../types/common/image';
import { TeamMember } from '../../../../../types/admin/team-members';
import { DragPreviewModel } from '../../../../../types/admin/common';

jest.mock('../../../../../assets/icons/dragger.svg', () => 'mock-dragger-icon');
jest.mock('../member-component/MemberComponent', () => ({
    MemberComponent: ({
        member,
        handleOnDeleteMember,
        handleOnEditMember,
    }: {
        member: TeamMember;
        handleOnDeleteMember: (fullName: string) => void;
        handleOnEditMember: (id: number) => void;
    }) => {
        handleOnDeleteMember(member.fullName);
        handleOnEditMember(member.id);

        return (
            <div data-testid="member-component" data-member-id={member.id}>
                {member.fullName}
            </div>
        );
    },
}));

const mockImage: Image = {
    id: 1,
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y4nYFMAAAAASUVORK5CYII=',
    mimeType: 'image/jpeg',
    size: 0,
};

const mockMember: TeamMember = {
    id: 1,
    fullName: 'John Doe',
    description: 'Software Engineer',
    img: mockImage,
    status: 'Чернетка',
    category: {
        id: 1,
        name: 'Основна команда',
        description: 'Test',
    },
};

const mockDragPreview: DragPreviewModel<TeamMember> = {
    visible: true,
    x: 100,
    y: 150,
    member: mockMember,
};

const mockDragPreviewWithoutMember: DragPreviewModel<TeamMember> = {
    visible: true,
    x: 100,
    y: 150,
    member: null,
};

describe('MemberDragPreview', () => {
    describe('Rendering with member', () => {
        test('renders drag preview with member', () => {
            render(<MemberDragPreview dragPreview={mockDragPreview} />);

            expect(screen.getByTestId('member-component')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        test('renders drag preview container with correct positioning', () => {
            const { container } = render(<MemberDragPreview dragPreview={mockDragPreview} />);

            const dragPreviewElement = container.querySelector('.drag-preview');
            expect(dragPreviewElement).toBeInTheDocument();
            expect(dragPreviewElement).toHaveStyle({
                left: '55px',
                top: '95px',
            });
        });

        test('renders dragger icon', () => {
            render(<MemberDragPreview dragPreview={mockDragPreview} />);

            const dragIcon = screen.getByAltText('dragger');
            expect(dragIcon).toBeInTheDocument();
            expect(dragIcon).toHaveAttribute('src', 'mock-dragger-icon');
        });

        test('renders members wrapper with correct class', () => {
            const { container } = render(<MemberDragPreview dragPreview={mockDragPreview} />);

            expect(container.querySelector('.members-wrapper')).toBeInTheDocument();
        });

        test('renders members dragger container', () => {
            const { container } = render(<MemberDragPreview dragPreview={mockDragPreview} />);

            expect(container.querySelector('.members-dragger')).toBeInTheDocument();
        });
    });

    describe('Positioning calculations', () => {
        test('calculates left position correctly (x - 45)', () => {
            const dragPreview = { ...mockDragPreview, x: 200 };
            const { container } = render(<MemberDragPreview dragPreview={dragPreview} />);

            const dragPreviewElement = container.querySelector('.drag-preview');
            expect(dragPreviewElement).toHaveStyle('left: 155px');
        });

        test('calculates top position correctly (y - 55)', () => {
            const dragPreview = { ...mockDragPreview, y: 300 };
            const { container } = render(<MemberDragPreview dragPreview={dragPreview} />);

            const dragPreviewElement = container.querySelector('.drag-preview');
            expect(dragPreviewElement).toHaveStyle('top: 245px');
        });

        test('handles zero coordinates', () => {
            const dragPreview = { ...mockDragPreview, x: 0, y: 0 };
            const { container } = render(<MemberDragPreview dragPreview={dragPreview} />);

            const dragPreviewElement = container.querySelector('.drag-preview');
            expect(dragPreviewElement).toHaveStyle({
                left: '-45px',
                top: '-55px',
            });
        });

        test('handles negative coordinates', () => {
            const dragPreview = { ...mockDragPreview, x: -10, y: -20 };
            const { container } = render(<MemberDragPreview dragPreview={dragPreview} />);

            const dragPreviewElement = container.querySelector('.drag-preview');
            expect(dragPreviewElement).toHaveStyle({
                left: '-55px',
                top: '-75px',
            });
        });
    });

    describe('Member component integration', () => {
        test('passes correct member prop to MemberComponent', () => {
            render(<MemberDragPreview dragPreview={mockDragPreview} />);

            const memberComponent = screen.getByTestId('member-component');
            expect(memberComponent).toHaveAttribute('data-member-id', '1');
        });

        test('passes empty function handlers to MemberComponent', () => {
            render(<MemberDragPreview dragPreview={mockDragPreview} />);

            expect(screen.getByTestId('member-component')).toBeInTheDocument();
        });

        test('renders different member data correctly', () => {
            const differentMember: TeamMember = {
                id: 2,
                fullName: 'Jane Smith',
                description: 'Product Manager',
                img: mockImage,
                status: 'Опубліковано',
                category: {
                    id: 1,
                    name: 'Наглядова рада',
                    description: 'Test',
                },
            };

            const dragPreview: DragPreviewModel<TeamMember> = { ...mockDragPreview, member: differentMember };
            render(<MemberDragPreview dragPreview={dragPreview} />);

            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByTestId('member-component')).toHaveAttribute('data-member-id', '2');
        });
    });

    describe('Empty state handling', () => {
        test('renders empty fragment when member is null', () => {
            const { container } = render(<MemberDragPreview dragPreview={mockDragPreviewWithoutMember} />);

            expect(container.firstChild).toBeNull();
            expect(screen.queryByTestId('member-component')).not.toBeInTheDocument();
        });

        test('does not render drag preview elements when member is null', () => {
            const { container } = render(<MemberDragPreview dragPreview={mockDragPreviewWithoutMember} />);

            expect(container.querySelector('.drag-preview')).not.toBeInTheDocument();
            expect(container.querySelector('.members-wrapper')).not.toBeInTheDocument();
            expect(container.querySelector('.members-dragger')).not.toBeInTheDocument();
        });

        test('does not render dragger icon when member is null', () => {
            render(<MemberDragPreview dragPreview={mockDragPreviewWithoutMember} />);

            expect(screen.queryByAltText('dragger')).not.toBeInTheDocument();
        });
    });

    describe('Props validation', () => {
        test('component receives dragPreview prop correctly', () => {
            const customDragPreview = {
                visible: true,
                x: 500,
                y: 600,
                member: mockMember,
            };

            const { container } = render(<MemberDragPreview dragPreview={customDragPreview} />);

            const dragPreviewElement = container.querySelector('.drag-preview');
            expect(dragPreviewElement).toHaveStyle({
                left: '455px',
                top: '545px',
            });
        });

        test('handles visible property correctly', () => {
            const dragPreview = { ...mockDragPreview, visible: false };
            render(<MemberDragPreview dragPreview={dragPreview} />);

            expect(screen.queryByTestId('member-component')).not.toBeInTheDocument();
        });
    });

    describe('CSS Classes', () => {
        test('applies correct CSS classes to all elements', () => {
            const { container } = render(<MemberDragPreview dragPreview={mockDragPreview} />);

            expect(container.querySelector('.drag-preview')).toBeInTheDocument();
            expect(container.querySelector('.members-wrapper')).toBeInTheDocument();
            expect(container.querySelector('.members-dragger')).toBeInTheDocument();
        });
    });

    describe('Edge cases', () => {
        test('handles undefined member gracefully', () => {
            const dragPreview: DragPreviewModel<TeamMember> = { ...mockDragPreview, member: null };
            const { container } = render(<MemberDragPreview dragPreview={dragPreview} />);

            expect(container.firstChild).toBeNull();
        });

        test('handles large coordinate values', () => {
            const dragPreview = { ...mockDragPreview, x: 99999, y: 88888 };
            const { container } = render(<MemberDragPreview dragPreview={dragPreview} />);

            const dragPreviewElement = container.querySelector('.drag-preview');
            expect(dragPreviewElement).toHaveStyle({
                left: '99954px',
                top: '88833px',
            });
        });
    });
});
