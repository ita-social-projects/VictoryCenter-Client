import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProgramListItem } from './ProgramListItem';
import { Program } from '../../../../../types/admin/Programs';
import { VisibilityStatus } from '../../../../../types/admin/Common';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { VisibilityStatusLabelProps } from '../../../../../components/common/visibility-status-label/VisibilityStatusLabel';

jest.mock('../../../../../assets/icons/blank-image.svg', () => 'blank-image.svg');

jest.mock('../../../../../components/common/button-tooltip/ButtonTooltip', () => ({
    ButtonTooltip: ({ children, position }: { children: React.ReactNode; position: string }) => {
        return (
            <div data-testid="tooltip-button" data-position={position}>
                {children}
            </div>
        );
    },
}));

jest.mock('../../../../../components/common/visibility-status-label/VisibilityStatusLabel', () => {
    const { VisibilityStatus } = require('../../../../../types/admin/Common');
    return {
        VisibilityStatusLabel: ({ status }: VisibilityStatusLabelProps) => {
            return <div data-testid="status">{VisibilityStatus[status]}</div>;
        },
    };
});

describe('ProgramListItem', () => {
    const mockProgram: Program = {
        id: 1,
        name: 'Test Program',
        description: 'Test program description',
        status: VisibilityStatus.Published,
        img: null,
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

    const renderProgramListItem = (overrideProps: Partial<typeof defaultProps> = {}) =>
        render(<ProgramListItem {...defaultProps} {...overrideProps} />);

    const getProgramName = () => screen.getByText('Test Program');
    const getProgramDescription = () => screen.getByText('Test program description');
    const getProgramImage = () => screen.getByAltText('Test Program-img');
    const getStatusComponent = () => screen.getByTestId('status');
    const getTooltipButton = () => screen.getByTestId('tooltip-button');

    const getPublishedTooltipText = () => screen.getByText(COMMON_TEXT_ADMIN.TOOLTIP.PUBLISHED_IN);
    const getDraftedTooltipText = () => screen.getByText(COMMON_TEXT_ADMIN.TOOLTIP.DRAFTED_IN);
    const getEditButton = () => document.querySelector('.edit-btn') as HTMLElement;
    const getDeleteButton = () => document.querySelector('.delete-btn') as HTMLElement;

    const getProgramItem = () => document.querySelector('.program-item');
    const getProgramInfo = () => document.querySelector('.program-info');
    const getProgramActions = () => document.querySelector('.program-actions');
    const getProgramActionsButtons = () => document.querySelector('.program-actions-buttons');

    const clickEditButton = () => fireEvent.click(getEditButton());
    const clickDeleteButton = () => fireEvent.click(getDeleteButton());

    const expectEditProgramCalled = () => {
        expect(mockHandleOnEditProgram).toHaveBeenCalledTimes(1);
        expect(mockHandleOnEditProgram).toHaveBeenCalledWith(mockProgram);
    };

    const expectDeleteProgramCalled = () => {
        expect(mockHandleOnDeleteProgram).toHaveBeenCalledTimes(1);
        expect(mockHandleOnDeleteProgram).toHaveBeenCalledWith(mockProgram);
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders program information correctly', () => {
        renderProgramListItem();

        expect(getProgramName()).toBeInTheDocument();
        expect(getProgramDescription()).toBeInTheDocument();
        expect(getProgramImage()).toBeInTheDocument();
    });

    it('uses blank image when program image is not provided', () => {
        const programWithoutImage = { ...mockProgram, img: null };
        renderProgramListItem({ program: programWithoutImage });

        const image = getProgramImage();
        expect(image).toHaveAttribute('src', 'blank-image.svg');
    });

    it('renders status component with correct status', () => {
        renderProgramListItem();

        const statusComponent = getStatusComponent();
        expect(statusComponent).toHaveTextContent(VisibilityStatus[VisibilityStatus.Published]);
    });

    it('displays published tooltip text and categories for published program', () => {
        renderProgramListItem();

        expect(getPublishedTooltipText()).toBeInTheDocument();
        expect(screen.getByText('Category 1')).toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
    });

    it('displays drafted tooltip text for drafted program', () => {
        const draftProgram: Program = { ...mockProgram, status: VisibilityStatus.Draft };
        renderProgramListItem({ program: draftProgram });

        // Використання константи замість hardcoded text
        expect(getDraftedTooltipText()).toBeInTheDocument();
        expect(screen.getByText('Category 1')).toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
    });

    it('calls handleOnEditProgram when edit button is clicked', () => {
        renderProgramListItem();

        expect(getEditButton()).not.toBeNull();

        clickEditButton();

        expectEditProgramCalled();
    });

    it('calls handleOnDeleteProgram when delete button is clicked', () => {
        renderProgramListItem();

        expect(getDeleteButton()).not.toBeNull();

        clickDeleteButton();

        expectDeleteProgramCalled();
    });

    it('renders tooltip button with correct position and applies proper CSS classes', () => {
        renderProgramListItem();

        const tooltipButton = getTooltipButton();
        expect(tooltipButton).toHaveAttribute('data-position', 'bottom');

        expect(getProgramItem()).toBeInTheDocument();
        expect(getProgramInfo()).toBeInTheDocument();
        expect(getProgramActions()).toBeInTheDocument();
        expect(getProgramActionsButtons()).toBeInTheDocument();
    });
});
