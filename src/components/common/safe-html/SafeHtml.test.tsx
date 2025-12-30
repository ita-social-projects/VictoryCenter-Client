import React from 'react';
import { render, screen } from '@testing-library/react';
import { SafeHtml } from './SafeHtml';
import DOMPurify from 'isomorphic-dompurify';

jest.mock('isomorphic-dompurify', () => ({
    __esModule: true,
    default: {
        sanitize: jest.fn(),
    },
}));

describe('SafeHtml', () => {
    const EXPECTED_CONFIG = {
        ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'br', 'span'],
        ALLOWED_ATTR: ['class'],
    };

    beforeEach(() => {
        (DOMPurify.sanitize as jest.Mock).mockImplementation((str) => str);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders default div tag with provided content', () => {
        const { container } = render(<SafeHtml html="<span>Hello</span>" />);
        const element = container.firstChild as HTMLElement;

        expect(element.tagName).toBe('DIV');
        expect(element).toHaveTextContent('Hello');
    });

    it('renders specified semantic tag via "as" prop', () => {
        const { container } = render(<SafeHtml as="h2" html="Title" />);
        const element = container.firstChild as HTMLElement;

        expect(element.tagName).toBe('H2');
    });

    it('calls DOMPurify.sanitize with correct arguments and configuration', () => {
        const dirtyHtml = '<strong>Safe</strong><script>alert(1)</script>';
        render(<SafeHtml html={dirtyHtml} />);

        expect(DOMPurify.sanitize).toHaveBeenCalledTimes(1);
        expect(DOMPurify.sanitize).toHaveBeenCalledWith(dirtyHtml, EXPECTED_CONFIG);
    });

    it('passes through standard HTML attributes', () => {
        render(<SafeHtml html="Content" className="test-class" id="test-id" data-testid="safe-html-root" />);
        const element = screen.getByTestId('safe-html-root');

        expect(element).toHaveClass('test-class');
        expect(element).toHaveAttribute('id', 'test-id');
    });

    it('handles empty html string gracefully', () => {
        const { container } = render(<SafeHtml html="" />);
        expect(container.firstChild).toBeEmptyDOMElement();
        expect(DOMPurify.sanitize).toHaveBeenCalledWith('', EXPECTED_CONFIG);
    });
});
