import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { PUBLIC_ROUTES } from '@/const/public/routes';

import { IntroSection } from './IntroSection';

const introData = {
    title: 'КОНІ<br />З ДОСВІДОМ<br />ЗЦІЛЕННЯ',
    description: 'Коли тіло та душа відновлюються<br />— народжується справжня сила.',
    buttonText: 'Переглянути програми',
    image: '/intro-image.webp',
};

const renderIntroSection = (props: Partial<React.ComponentProps<typeof IntroSection>> = {}) => {
    return render(
        <MemoryRouter>
            <IntroSection introData={introData} buttonHref={PUBLIC_ROUTES.PROGRAMS.FULL} {...props} />
        </MemoryRouter>,
    );
};

describe('IntroSection', () => {
    it('renders intro content, image and semantic programs link', () => {
        const { container } = renderIntroSection();
        const heading = screen.getByRole('heading', { level: 1 });
        const description = container.querySelector('.description');

        expect(heading).toHaveTextContent('КОНІЗ ДОСВІДОМЗЦІЛЕННЯ');
        expect(heading.innerHTML).toContain('КОНІ<br>З ДОСВІДОМ<br>ЗЦІЛЕННЯ');
        expect(description).toHaveTextContent('Коли тіло та душа відновлюються— народжується справжня сила.');
        expect(description?.innerHTML).toContain(
            'Коли тіло та душа відновлюються<br>— народжується справжня сила.',
        );

        const image = container.querySelector('img');

        expect(image).toHaveAttribute('src', introData.image);
        expect(image).toHaveAttribute('alt', '');
        expect(image).toHaveAttribute('aria-hidden', 'true');
        expect(container.querySelector('.root')).toBeInTheDocument();
        expect(container.querySelector('.overlay')).toBeInTheDocument();
        expect(container.querySelector('.content')).toBeInTheDocument();
        expect(container.querySelector('.bottomContent')).toBeInTheDocument();
    });

    it('opens programs link in a new tab', () => {
        renderIntroSection();

        const programsLink = screen.getByRole('link', { name: introData.buttonText });

        expect(programsLink).toHaveAttribute('href', PUBLIC_ROUTES.PROGRAMS.FULL);
        expect(programsLink).toHaveAttribute('target', '_blank');
        expect(programsLink).toHaveAttribute('rel', 'noopener noreferrer');
        expect(programsLink).toHaveClass('button');
    });

    it('renders safely when intro data fields are empty', () => {
        const sparseIntroData = {
            title: '',
            description: '',
            buttonText: '',
            image: null,
        };

        const { container } = renderIntroSection({
            introData: sparseIntroData as unknown as React.ComponentProps<typeof IntroSection>['introData'],
        });

        expect(container.querySelector('section')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        expect(container.querySelector('img')).not.toHaveAttribute('src');
        expect(screen.getByRole('link')).toHaveAttribute('href', PUBLIC_ROUTES.PROGRAMS.FULL);
    });

    it('does not crash when image is missing at runtime', () => {
        const introDataWithoutImage = {
            ...introData,
            image: null,
        };

        const { container } = renderIntroSection({
            introData: introDataWithoutImage as unknown as React.ComponentProps<typeof IntroSection>['introData'],
        });

        expect(container.querySelector('section')).toBeInTheDocument();
        expect(container.querySelector('img')).not.toHaveAttribute('src', introData.image);
    });
});
