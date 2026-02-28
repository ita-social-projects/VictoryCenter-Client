import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { AddSectionModal } from './AddSectionModal';
import type { AddSectionModalProps } from './AddSectionModal';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { ProgramSectionTemplate, ProgramSectionMode } from '@/types/common/program-sections';
import type { ButtonProps } from '@/components/admin/button/Button';
import type { ModalProps } from '@/components/common/modal/Modal';

const mockRenderProgramSection = jest.fn((_: any) => <div data-testid="rendered-section" />);

let mockSwiperActiveIndex = 0;
let mockSwiperItems: any[] = [];
let mockSwiperExtraItems: any[] = [];
let mockSwiperNavigationButtons: any;

jest.mock('@/utils/functions/render-program-section', () => ({
    renderProgramSection: (payload: any) => mockRenderProgramSection(payload),
}));

jest.mock('@/components/public/swiper/Swiper', () => ({
    Swiper: ({ items, renderItem, onSlideChange, className, navigationButtons }: any) => {
        mockSwiperNavigationButtons = navigationButtons;

        const allItems = [...items, ...mockSwiperExtraItems];
        mockSwiperItems = allItems;

        const handlePrev = () => {
            mockSwiperActiveIndex = mockSwiperActiveIndex === 0 ? allItems.length - 1 : mockSwiperActiveIndex - 1;
            onSlideChange?.(mockSwiperActiveIndex);
        };

        const handleNext = () => {
            mockSwiperActiveIndex = mockSwiperActiveIndex === allItems.length - 1 ? 0 : mockSwiperActiveIndex + 1;
            onSlideChange?.(mockSwiperActiveIndex);
        };

        return (
            <div data-testid="swiper" className={className}>
                {allItems.map((item: any, index: number) => (
                    <div key={`${String(item)}-${index}`} data-testid="swiper-slide">
                        {renderItem(item, index)}
                    </div>
                ))}
                <button type="button" onClick={handlePrev} title="Previous slide">
                    Prev
                </button>
                <button type="button" onClick={handleNext} title="Next slide">
                    Next
                </button>
            </div>
        );
    },
}));

jest.mock('@/assets/icons/chevron-left.svg', () => ({
    ReactComponent: () => <svg data-testid="chevron-left" />,
}));

jest.mock('@/assets/icons/chevron-right.svg', () => ({
    ReactComponent: () => <svg data-testid="chevron-right" />,
}));

jest.mock('@/assets/images/common/section-photo-placeholder.png', () => 'placeholder.png');

jest.mock('@/components/common/modal/Modal', () => {
    const ModalMock = ({
        isOpen,
        onClose,
        children,
        maxWidth,
        className,
    }: ModalProps & { maxWidth?: string; className?: string }) =>
        isOpen ? (
            <div data-testid="add-section-modal" data-max-width={maxWidth} data-classname={className}>
                <button data-testid="modal-close-btn" onClick={onClose}>
                    X
                </button>
                {children}
            </div>
        ) : null;

    ModalMock.Title = ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>;
    ModalMock.Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
    ModalMock.Actions = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

    return { __esModule: true, Modal: ModalMock };
});

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, buttonStyle }: ButtonProps & { buttonStyle?: string }) => (
        <button onClick={onClick} disabled={disabled} data-button-style={buttonStyle}>
            {children}
        </button>
    ),
}));

const clickChoose = () => fireEvent.click(screen.getByRole('button', { name: PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION }));
const clickPrev = () => fireEvent.click(screen.getByTitle('Previous slide'));
const clickNext = () => fireEvent.click(screen.getByTitle('Next slide'));
const clickClose = () => fireEvent.click(screen.getByTestId('modal-close-btn'));

const getCallByTemplate = (templateId: any) => {
    const calls = mockRenderProgramSection.mock.calls.map((call) => call[0]);
    return calls.find((item) => item?.templateId === templateId);
};

const buildFiveShortDescriptions = () =>
    Array.from({ length: 5 }, () => PROGRAMS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT_SHORT);

describe('AddSectionModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSelectTemplate = jest.fn();

    const renderModal = (overrides: Partial<AddSectionModalProps> = {}) => {
        const props: AddSectionModalProps = {
            isOpen: true,
            onClose: mockOnClose,
            onSelectTemplate: mockOnSelectTemplate,
            ...overrides,
        };

        render(<AddSectionModal {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockSwiperActiveIndex = 0;
        mockSwiperItems = [];
        mockSwiperExtraItems = [];
        mockSwiperNavigationButtons = undefined;
    });

    it('does not render when closed', () => {
        renderModal({ isOpen: false });
        expect(screen.queryByTestId('add-section-modal')).not.toBeInTheDocument();
    });

    it('renders modal, swiper and choose button when open', () => {
        renderModal();

        expect(screen.getByTestId('add-section-modal')).toBeInTheDocument();
        expect(screen.getByTestId('swiper')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION })).toBeInTheDocument();
    });

    it('passes maxWidth and className into Modal', () => {
        renderModal();

        const modal = screen.getByTestId('add-section-modal');
        expect(modal).toHaveAttribute('data-max-width', '90vw');
        expect(modal).toHaveAttribute('data-classname');
    });

    it('renders navigation buttons', () => {
        renderModal();

        expect(screen.getByTitle('Previous slide')).toBeInTheDocument();
        expect(screen.getByTitle('Next slide')).toBeInTheDocument();
    });

    it('passes navigation config into Swiper', () => {
        renderModal();

        expect(mockSwiperNavigationButtons).toBeDefined();
        expect(mockSwiperNavigationButtons?.prev).toBeDefined();
        expect(mockSwiperNavigationButtons?.next).toBeDefined();
    });

    it('renders modal content container', () => {
        renderModal();
        expect(screen.getAllByTestId('add-section-modal-content')[0]).toBeInTheDocument();
    });

    it('close button calls onClose', () => {
        renderModal();
        clickClose();
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('choose selects current template and closes modal', () => {
        renderModal();

        clickChoose();

        expect(mockOnSelectTemplate).toHaveBeenCalledTimes(1);
        expect(mockOnSelectTemplate).toHaveBeenCalledWith(mockSwiperItems[0]);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('next changes selection to the next template', () => {
        renderModal();

        clickNext();
        clickChoose();

        expect(mockOnSelectTemplate).toHaveBeenCalledWith(mockSwiperItems[1]);
    });

    it('previous from first wraps to last', () => {
        renderModal();

        clickPrev();
        clickChoose();

        expect(mockOnSelectTemplate).toHaveBeenCalledWith(mockSwiperItems[mockSwiperItems.length - 1]);
    });

    it('next from last wraps to first', () => {
        renderModal();

        clickPrev();
        clickNext();
        clickChoose();

        expect(mockOnSelectTemplate).toHaveBeenCalledWith(mockSwiperItems[0]);
    });

    it('calls renderProgramSection and always uses mode=Template', () => {
        renderModal();

        expect(mockRenderProgramSection).toHaveBeenCalled();
        expect(mockRenderProgramSection.mock.calls.every((c) => c[0]?.mode === ProgramSectionMode.Template)).toBe(true);
    });

    it('passes sample title/description into non-card templates', () => {
        renderModal();

        const call = getCallByTemplate(ProgramSectionTemplate.TextOnly);
        expect(call?.data?.title).toBe(PROGRAMS_TEXT.SECTION.TITLE_SAMPLE_TEXT);
        expect(call?.data?.description).toBe(PROGRAMS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT);
    });

    it('passes sample title/description into SingleTitleDescriptionAuthorPairs template', () => {
        renderModal();

        const call = getCallByTemplate(ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs);
        expect(call?.data?.title).toBe(PROGRAMS_TEXT.SECTION.TITLE_SAMPLE_TEXT);
        expect(call?.data?.description).toBe(PROGRAMS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT);
    });

    it('provides 5 short descriptions only for SingleTitleQuintupleDescription', () => {
        renderModal();

        expect(getCallByTemplate(ProgramSectionTemplate.SingleTitleQuintupleDescription)?.data?.descriptions).toEqual(
            buildFiveShortDescriptions(),
        );
        expect(getCallByTemplate(ProgramSectionTemplate.TextOnly)?.data?.descriptions).toBeUndefined();
    });

    it.each([
        [ProgramSectionTemplate.QuadImagesBottom, 4],
        [ProgramSectionTemplate.TripleImagesBottom, 3],
        [ProgramSectionTemplate.DualImagesBottom, 2],
        [ProgramSectionTemplate.SingleImageBottom, 1],
        [ProgramSectionTemplate.SingleImageTop, 1],
        [ProgramSectionTemplate.SingleImageRight, 1],
        [ProgramSectionTemplate.TextOnly, 0],
        [ProgramSectionTemplate.SingleTitleQuintupleDescription, 0],
        [ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs, 0],
    ] as Array<[ProgramSectionTemplate, number]>)('provides correct placeholder images for %s', (templateId, count) => {
        renderModal();

        const images = getCallByTemplate(templateId)?.data?.images ?? [];
        expect(images).toHaveLength(count);

        expect(images.every((img: any) => img === 'placeholder.png' || img?.url === 'placeholder.png')).toBe(true);
    });

    it('unknown template id falls back to empty images array', () => {
        mockSwiperExtraItems = ['UNKNOWN_TEMPLATE_ID'] as any[];

        renderModal();

        expect(getCallByTemplate('UNKNOWN_TEMPLATE_ID')?.data?.images).toEqual([]);
    });

    it.each([
        [ProgramSectionTemplate.DualTitleDescriptionPairs, 2],
        [ProgramSectionTemplate.TripleTitleDescriptionPairs, 3],
        [ProgramSectionTemplate.QuadTitleDescriptionPairs, 4],
    ] as Array<[ProgramSectionTemplate, number]>)('renders %s with %d cards', (templateId, count) => {
        renderModal();

        const call = getCallByTemplate(templateId);
        expect(call).toBeDefined();
        expect(call?.data?.cards).toHaveLength(count);
    });
});
