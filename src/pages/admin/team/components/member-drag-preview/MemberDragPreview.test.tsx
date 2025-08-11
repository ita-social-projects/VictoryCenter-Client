import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemberDragPreview } from './MemberDragPreview';
import { VisibilityStatus } from '../../../../../types/admin/common';

const baseMember = {
    id: 1,
    image: null,
    fullName: 'John Doe',
    description: 'Developer',
    status: VisibilityStatus.Draft,
    categoryId: 2,
};

describe('MemberDragPreview', () => {
    it('renders nothing when visible=false', () => {
        const { container } = render(
            <MemberDragPreview dragPreview={{ visible: false, x: 0, y: 0, item: baseMember }} />,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when member=null', () => {
        const { container } = render(<MemberDragPreview dragPreview={{ visible: true, x: 0, y: 0, item: null }} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders preview with correct position and member details', () => {
        const { container } = render(
            <MemberDragPreview dragPreview={{ visible: true, x: 100, y: 200, item: baseMember }} />,
        );

        fireEvent.click(container.querySelector('.members-actions-edit')!);

        fireEvent.click(container.querySelector('.members-actions-delete')!);

        const preview = container.querySelector('.drag-preview') as HTMLDivElement;
        expect(preview).toHaveStyle({ left: `${55}px`, top: `${145}px` });
        expect(screen.getByText(baseMember.fullName)).toBeInTheDocument();
    });
});
