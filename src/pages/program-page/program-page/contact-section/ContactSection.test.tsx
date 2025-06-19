import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ContactSection } from './ContactSection';

describe('ContactSection', () => {
    test('should render correctly', () => {
        render(<ContactSection/>);
        const title = screen.getByRole('heading', {name: 'Не впевнені, яка програма підійде саме вам?'});
        expect(title).toBeInTheDocument();
        expect(title).toHaveClass('contact-title');
        
        const subtitle = screen.getByRole('heading', {name: 'Напишіть нам — ми разом підберемо те, ' +
                'що найкраще відповідає вашим потребам або потребам вашої дитини.'});
        expect(subtitle).toBeInTheDocument();
        
        const button = screen.getByRole('button', {name: 'Звʼязатись з нами'});
        expect(button).toBeInTheDocument();
    });
    test('should render background video correctly', () => {
        render(<ContactSection/>);
        const videoElement = document.querySelector('video');
        expect(videoElement).toBeInTheDocument();
        expect(videoElement).toHaveAttribute('autoplay');
        expect(videoElement).toHaveAttribute('loop');
        expect(videoElement).toHaveAttribute('playsinline');
    });
    test('should have correct container name', () => {
        const {container} = render(<ContactSection/>);
        expect(container.querySelector('.contact-us-block')).toBeInTheDocument();
        const videoElement = document.querySelector('video')?.closest('.contact-us-block');
        expect(videoElement).toBeInTheDocument();
    });
});