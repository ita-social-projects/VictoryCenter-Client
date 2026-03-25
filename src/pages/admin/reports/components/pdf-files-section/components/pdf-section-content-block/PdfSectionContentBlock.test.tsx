import { render, screen } from '@testing-library/react';
import { PdfSectionContentBlock } from './PdfSectionContentBlock';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';

describe('PdfSectionContentBlock', () => {
    const mockContent = {
        title: 'Test Section Title',
        description: 'Test Section Description',
    };

    it('should render title and description', () => {
        render(<PdfSectionContentBlock content={mockContent} />);

        expect(screen.getByText(PDF_FILES_SECTION_TEXT.VIEW.TITLE)).toBeInTheDocument();
        expect(screen.getByText(mockContent.title)).toBeInTheDocument();
        expect(screen.getByText(PDF_FILES_SECTION_TEXT.VIEW.DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByText(mockContent.description)).toBeInTheDocument();
    });

    it('should apply correct classes for view mode', () => {
        const { container } = render(<PdfSectionContentBlock content={mockContent} />);

        const rootDiv = container.firstChild;
        expect(rootDiv).toHaveClass('root', 'view-root');

        const titleText = screen.getByText(mockContent.title);
        expect(titleText).toHaveClass('view-text', 'view-text-title');
    });
});
