import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { IntroSection } from './IntroSection';

const introData = {
    title: 'Victory Center',
    description: 'Intro description',
    buttonText: 'Переглянути програми',
    image: '/intro-image.webp',
};

describe('IntroSection', () => {
    it('opens programs link in a new tab', () => {
        render(
            <MemoryRouter>
                <IntroSection introData={introData} buttonHref="/programs" />
            </MemoryRouter>,
        );

        const programsLink = screen.getByRole('link', { name: introData.buttonText });

        expect(programsLink).toHaveAttribute('href', '/programs');
        expect(programsLink).toHaveAttribute('target', '_blank');
        expect(programsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
});
