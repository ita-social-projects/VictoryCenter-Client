import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { AddSectionModal } from './AddSectionModal';
import type { AddSectionModalProps } from './AddSectionModal';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import { SectionTemplate, SectionMode } from '@/types/common/sections';
import type { ButtonProps } from '@/components/admin/button/Button';
import type { ModalProps } from '@/components/common/modal/Modal';
import {
    buildFiveShortDescriptions as utilBuildFiveShortDescriptions,
    clickChooseButton as utilClickChooseButton,
    clickCloseButton as utilClickCloseButton,
    clickNextButton as utilClickNextButton,
    clickPrevButton as utilClickPrevButton,
    findFirstCallByTemplateId as utilFindFirstCallByTemplateId,
    getChooseButton as utilGetChooseButton,
    getCloseButton as utilGetCloseButton,
    getContentAreas as utilGetContentAreas,
    getModal as utilGetModal,
    getNextButton as utilGetNextButton,
    getPrevButton as utilGetPrevButton,
    getSwiper as utilGetSwiper,
    renderAddSectionModal as utilRenderAddSectionModal,
} from './test-utils/addSectionModalTestUtils';

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

jest.mock('@/assets/images/section-photo-placeholder.png', () => 'placeholder.png');

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

const clickChoose = () => fireEvent.click(screen.getByRole('button', { name: SECTIONS_TEXT.BUTTON.CHOOSE_SECTION }));
const clickPrev = () => fireEvent.click(screen.getByTitle('Previous slide'));
const clickNext = () => fireEvent.click(screen.getByTitle('Next slide'));
const clickClose = () => fireEvent.click(screen.getByTestId('modal-close-btn'));

const getCallByTemplate = (templateId: any) => {
    const calls = mockRenderProgramSection.mock.calls.map((call) => call[0]);
    return calls.find((item) => item?.templateId === templateId);
};

const buildFiveShortDescriptions = () =>
    Array.from({ length: 5 }, () => SECTIONS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT_SHORT);

describe('AddSectionModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSelectTemplate = jest.fn();

    const defaultTemplates: SectionTemplate[] = [
        SectionTemplate.QuadImagesBottom,
        SectionTemplate.DualImagesBottom,
        SectionTemplate.TextOnly,
        SectionTemplate.TripleImagesBottom,
        SectionTemplate.SingleImageBottom,
        SectionTemplate.SingleImageTop,
        SectionTemplate.SingleImageRight,
        SectionTemplate.SingleTitleQuintupleDescription,
        SectionTemplate.DualTitleDescriptionPairs,
        SectionTemplate.TripleTitleDescriptionPairs,
        SectionTemplate.QuadTitleDescriptionPairs,
        SectionTemplate.SingleTitleDescriptionAuthorPairs,
        SectionTemplate.SingleTitleQuestionAnswerPairs,
    ];

    const renderModal = (overrides: Partial<AddSectionModalProps> = {}) => {
        const props: AddSectionModalProps = {
            isOpen: true,
            onClose: mockOnClose,
            onSelectTemplate: mockOnSelectTemplate,
            templates: defaultTemplates,
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
        expect(screen.getByRole('button', { name: SECTIONS_TEXT.BUTTON.CHOOSE_SECTION })).toBeInTheDocument();
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
        expect(mockRenderProgramSection.mock.calls.every((c) => c[0]?.mode === SectionMode.Template)).toBe(true);
    });

    it('passes sample title/description into non-card templates', () => {
        renderModal();

        const call = getCallByTemplate(SectionTemplate.TextOnly);
        expect(call?.data?.title).toBe(SECTIONS_TEXT.SECTION.TITLE_SAMPLE_TEXT);
        expect(call?.data?.description).toBe(SECTIONS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT);
    });

    it('passes sample title/description into SingleTitleDescriptionAuthorPairs template', () => {
        renderModal();

        const call = getCallByTemplate(SectionTemplate.SingleTitleDescriptionAuthorPairs);
        expect(call?.data?.title).toBe(SECTIONS_TEXT.SECTION.SINGLE_TITLE_DESCRIPTION_AUTHOR_PAIRS.DEFAULT_TITLE);
        expect(call?.data?.description).toBe(SECTIONS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT);
    });

    it('provides 5 short descriptions only for SingleTitleQuintupleDescription', () => {
        renderModal();

        expect(getCallByTemplate(SectionTemplate.SingleTitleQuintupleDescription)?.data?.descriptions).toEqual(
            buildFiveShortDescriptions(),
        );
        expect(getCallByTemplate(SectionTemplate.TextOnly)?.data?.descriptions).toBeUndefined();
    });

    it.each([
        [SectionTemplate.QuadImagesBottom, 4],
        [SectionTemplate.TripleImagesBottom, 3],
        [SectionTemplate.DualImagesBottom, 2],
        [SectionTemplate.SingleImageBottom, 1],
        [SectionTemplate.SingleImageTop, 1],
        [SectionTemplate.SingleImageRight, 1],
        [SectionTemplate.TextOnly, 0],
        [SectionTemplate.SingleTitleQuintupleDescription, 0],
        [SectionTemplate.SingleTitleDescriptionAuthorPairs, 0],
    ] as Array<[SectionTemplate, number]>)('provides correct placeholder images for %s', (templateId, count) => {
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
        [SectionTemplate.DualTitleDescriptionPairs, 2],
        [SectionTemplate.TripleTitleDescriptionPairs, 3],
        [SectionTemplate.QuadTitleDescriptionPairs, 4],
    ] as Array<[SectionTemplate, number]>)('renders %s with %d cards', (templateId, count) => {
        renderModal();

        const call = getCallByTemplate(templateId);
        expect(call).toBeDefined();
        expect(call?.data?.cards).toHaveLength(count);
    });

    it('covers test-utils helper functions with the existing modal setup', () => {
        utilRenderAddSectionModal({
            isOpen: true,
            onClose: mockOnClose,
            onSelectTemplate: mockOnSelectTemplate,
            templates: defaultTemplates,
        });

        expect(utilGetModal()).toBeInTheDocument();
        expect(utilGetSwiper()).toBeInTheDocument();
        expect(utilGetChooseButton()).toBeInTheDocument();
        expect(utilGetPrevButton()).toBeInTheDocument();
        expect(utilGetNextButton()).toBeInTheDocument();
        expect(utilGetCloseButton()).toBeInTheDocument();
        expect(utilGetContentAreas().length).toBeGreaterThan(0);

        utilClickPrevButton();
        utilClickNextButton();
        utilClickChooseButton();
        utilClickCloseButton();

        expect(mockOnSelectTemplate).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
        expect(utilBuildFiveShortDescriptions()).toEqual(buildFiveShortDescriptions());

        const calls = jest.fn();
        calls({ templateId: SectionTemplate.TextOnly });
        calls({ templateId: SectionTemplate.SingleImageTop });

        expect(utilFindFirstCallByTemplateId(calls, SectionTemplate.TextOnly)).toEqual({
            templateId: SectionTemplate.TextOnly,
        });
        expect(utilFindFirstCallByTemplateId(calls, SectionTemplate.QuadImagesBottom)).toBeUndefined();
    });

    it('covers test-utils modal query in closed mode', () => {
        utilRenderAddSectionModal({
            isOpen: false,
            onClose: mockOnClose,
            onSelectTemplate: mockOnSelectTemplate,
            templates: defaultTemplates,
        });

        expect(utilGetModal()).not.toBeInTheDocument();
    });
});
