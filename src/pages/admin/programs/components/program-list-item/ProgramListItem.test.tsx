import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgramListItem } from './ProgramListItem';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { Program } from '../../../../../types/ProgramAdminPage';
import { VisibilityStatus } from '../../../../../types/Common';

// Mock the imported components and constants
jest.mock('../../../../../components/common/button-tooltip/ButtonTooltip', () => {
    return function MockTooltipButton({ children, position }: { children: React.ReactNode; position: string }) {
        return (
            <div data-testid="tooltip-button" data-position={position}>
                {children}
            </div>
        );
    };
});

jest.mock('../../../../../components/common/status/Status', () => {
    return function MockStatus({ status }: { status: VisibilityStatus }) {
        return (
            <div data-testid="status" data-status={status}>
                {status}
            </div>
        );
    };
});

jest.mock('../../../../../assets/images/admin/blank-image.svg', () => 'blank-image.svg');

jest.mock('../../../../../const/admin/common', () => ({
    COMMON_TEXT_ADMIN: {
        TOOLTIP: {
            PUBLISHED_IN: 'Published in:',
            DRAFTED_IN: 'Drafted in:',
        },
    },
}));

describe('ProgramListItem', () => {
    const mockProgram: Program = {
        id: 1,
        name: 'Test Program',
        description: 'Test program description',
        status: 'Published',
        img: 'test-image.jpg',
        categories: [
            { id: 1, name: 'Category 1', programsCount: 1 },
            { id: 2, name: 'Category 2', programsCount: 2 },
        ],
    };

    const mockHandleOnDeleteProgram = jest.fn();
    const mockHandleOnEditProgram = jest.fn();

    const defaultProps = {
        program: mockProgram,
        handleOnDeleteProgram: mockHandleOnDeleteProgram,
        handleOnEditProgram: mockHandleOnEditProgram,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders program information correctly', () => {
        render(<ProgramListItem {...defaultProps} />);

        expect(screen.getByText('Test Program')).toBeInTheDocument();
        expect(screen.getByText('Test program description')).toBeInTheDocument();
        expect(screen.getByAltText('Test Program-img')).toBeInTheDocument();
        expect(screen.getByAltText('Test Program-img')).toHaveAttribute('src', 'test-image.jpg');
    });

    it('uses blank image when program image is not provided', () => {
        const programWithoutImage = { ...mockProgram, img: null };
        render(<ProgramListItem {...defaultProps} program={programWithoutImage} />);

        const image = screen.getByAltText('Test Program-img');
        expect(image).toHaveAttribute('src', 'blank-image.svg');
    });

    it('renders status component with correct status', () => {
        render(<ProgramListItem {...defaultProps} />);

        const statusComponent = screen.getByTestId('status');
        expect(statusComponent).toHaveAttribute('data-status', 'Published');
        expect(statusComponent).toHaveTextContent('Published');
    });

    it('displays published tooltip text and categories for published program', () => {
        render(<ProgramListItem {...defaultProps} />);

        expect(screen.getByText('Published in:')).toBeInTheDocument();
        expect(screen.getByText('Category 1')).toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
    });

    it('displays drafted tooltip text for drafted program', () => {
        const draftProgram: Program = { ...mockProgram, status: 'Draft' };
        render(<ProgramListItem {...defaultProps} program={draftProgram} />);

        expect(screen.getByText('Drafted in:')).toBeInTheDocument();
        expect(screen.getByText('Category 1')).toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
    });

    it('calls handleOnEditProgram when edit button is clicked', () => {
        const { container } = render(<ProgramListItem {...defaultProps} />);

        const editButton = container.querySelector('.edit-btn');
        expect(editButton).not.toBeNull();

        fireEvent.click(editButton!);

        expect(mockHandleOnEditProgram).toHaveBeenCalledTimes(1);
        expect(mockHandleOnEditProgram).toHaveBeenCalledWith(mockProgram);
    });

    it('calls handleOnDeleteProgram when delete button is clicked', () => {
        render(<ProgramListItem {...defaultProps} />);

        const deleteButton = document.querySelector('.delete-btn');

        expect(deleteButton).not.toBeNull();

        fireEvent.click(deleteButton!!);

        expect(mockHandleOnDeleteProgram).toHaveBeenCalledTimes(1);
        expect(mockHandleOnDeleteProgram).toHaveBeenCalledWith(mockProgram);
    });

    it('renders tooltip button with correct position and applies proper CSS classes', () => {
        const { container } = render(<ProgramListItem {...defaultProps} />);

        const tooltipButton = screen.getByTestId('tooltip-button');
        expect(tooltipButton).toHaveAttribute('data-position', 'bottom');

        expect(container.querySelector('.program-item')).toBeInTheDocument();
        expect(container.querySelector('.program-info')).toBeInTheDocument();
        expect(container.querySelector('.program-actions')).toBeInTheDocument();
        expect(container.querySelector('.program-actions-buttons')).toBeInTheDocument();
    });
});
