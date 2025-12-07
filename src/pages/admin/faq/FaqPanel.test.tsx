import { FaqPanel } from './FaqPanel';
import { render, screen } from '@testing-library/react';

jest.mock('./components/faq-panel-content/FaqPanelContent', () => ({
    FaqPanelContent: () => <div data-testid="faq-panel-content">Faq Panel Content</div>,
}));

jest.mock('@contexts/admin/visitor-pages-provider/VisitorPagesProvider', () => ({
    VisitorPagesProvider: ({ children }: any) => <div data-testid="visitor-pages-provider">{children}</div>,
}));

describe('FaqPanel', () => {
    it('should render FaqPanelContent inside VisitorPagesProvider', () => {
        render(<FaqPanel />);
        const provider = screen.getByTestId('visitor-pages-provider');
        expect(provider).toBeInTheDocument();
        expect(screen.getByTestId('faq-panel-content')).toBeInTheDocument();
        expect(screen.getByText('Faq Panel Content')).toBeInTheDocument();
    });
});
