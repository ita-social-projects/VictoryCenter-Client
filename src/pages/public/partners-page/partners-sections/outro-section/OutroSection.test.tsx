import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OutroSection } from './OutroSection';
import { OUTRO } from '../../../../../const/partners-page/partners-page';

jest.mock('../../../../../assets/partners-page-images/outro.mp4', () => 'mocked-outro-video');

jest.mock('../../../../../const/partners-page/partners-page', () => ({
    OUTRO: {
        TITLE: {
            FIRST_LINE: 'Mocked Title',
        },
        TEXT: 'Mocked description text',
        BUTTON_BECOME_SUPPORT_TEXT: 'Become Support',
        BUTTON_SUPPORT_TEXT: 'Support Us',
    },
}));

const renderComponent = () => {
    return render(<OutroSection />);
};

describe('OutroSection', () => {
    it('renders without crashing', () => {
        renderComponent();
        const container = document.querySelector('.video-background-container');
        expect(container).toBeInTheDocument();
    });

    it('renders video source with correct src and type', () => {
        renderComponent();
        const videoSource = document.querySelector('source');
        expect(videoSource).toBeInTheDocument();
        expect(videoSource).toHaveAttribute('src', 'mocked-outro-video');
        expect(videoSource).toHaveAttribute('type', 'video/mp4');
    });

    it('displays the title from constants', () => {
        renderComponent();
        const title = screen.getByText('Mocked Title');
        expect(title).toBeInTheDocument();
        expect(title).toHaveClass('video-text-partners');
        expect(title.tagName).toBe('H1');
    });

    it('displays the description text from constants', () => {
        renderComponent();
        const description = screen.getByText('Mocked description text');
        expect(description).toBeInTheDocument();
        expect(description).toHaveClass('video-description');
        expect(description.tagName).toBe('P');
    });

    it('renders both action buttons with correct text', () => {
        renderComponent();
        const primaryButton = screen.getByText('Become Support');
        const secondaryButton = screen.getByText('Support Us');

        expect(primaryButton).toBeInTheDocument();
        expect(secondaryButton).toBeInTheDocument();

        expect(primaryButton).toHaveClass('btn-primary');
        expect(secondaryButton).toHaveClass('btn-secondary');

        expect(primaryButton.tagName).toBe('BUTTON');
        expect(secondaryButton.tagName).toBe('BUTTON');
    });

    it('has the correct CSS structure', () => {
        renderComponent();
        const container = document.querySelector('.video-background-container');
        const buttonsContainer = document.querySelector('.video-buttons');

        expect(container).toBeInTheDocument();
        expect(buttonsContainer).toBeInTheDocument();
    });

    it('has buttons container with proper structure', () => {
        renderComponent();
        const buttonsContainer = document.querySelector('.video-buttons');
        const buttons = buttonsContainer?.querySelectorAll('button');

        expect(buttonsContainer).toBeInTheDocument();
        expect(buttons).toHaveLength(2);
    });

    it('uses constants for all text content', () => {
        renderComponent();
        expect(screen.getByText(OUTRO.TITLE.FIRST_LINE)).toBeInTheDocument();
        expect(screen.getByText(OUTRO.TEXT)).toBeInTheDocument();
        expect(screen.getByText(OUTRO.BUTTON_BECOME_SUPPORT_TEXT)).toBeInTheDocument();
        expect(screen.getByText(OUTRO.BUTTON_SUPPORT_TEXT)).toBeInTheDocument();
    });
});
