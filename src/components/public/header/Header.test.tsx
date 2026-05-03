import '@testing-library/jest-dom';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Header } from './Header';
import { MemoryRouter } from 'react-router-dom';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import headerUk from '@/locales/uk/header.json';

jest.mock('./Header.scss', () => ({}));

jest.mock('@/assets/icons/logo-with-text.svg', () => ({
    ReactComponent: () => <svg data-testid="logo" />,
}));
jest.mock('@/assets/icons/chevron-up.svg', () => ({
    ReactComponent: () => <svg data-testid="chevron-up" />,
}));
jest.mock('@/assets/icons/chevron-down.svg', () => ({
    ReactComponent: () => <svg data-testid="chevron-down" />,
}));
jest.mock('@/assets/icons/menu.svg', () => ({
    ReactComponent: () => <svg data-testid="menu" />,
}));
jest.mock('@/assets/icons/cross.svg', () => ({
    ReactComponent: () => <svg data-testid="close" />,
}));
jest.mock('@/assets/icons/burger.svg', () => ({
    ReactComponent: () => <div data-testid="burger-icon" />,
}));

jest.mock('@/components/public/dropdown-menu/DropdownMenu', () => ({
    DropdownMenu: ({ mainText, links }: { mainText: string; links: any[] }) => (
        <div data-testid="dropdown-mock">
            <span>{mainText}</span>
            <ul>
                {links.map((link) => (
                    <li key={link.text}>
                        <a href={link.navigateTo || '#'} data-disabled={link.isDisabled}>
                            {link.text}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    ),
}));

jest.mock('@/components/public/ui/button', () => ({
    Button: ({
        children,
        onClick,
        href,
        icon: Icon,
        className,
        ariaLabel,
    }: {
        children?: React.ReactNode;
        onClick?: () => void;
        href?: string;
        icon?: React.ElementType;
        className?: string;
        ariaLabel?: string;
    }) => {
        const content = (
            <>
                {Icon && <Icon />}
                {children}
            </>
        );
        if (href) {
            return (
                <a href={href} className={className} aria-label={ariaLabel}>
                    {content}
                </a>
            );
        }
        return (
            <button onClick={onClick} className={className} aria-label={ariaLabel}>
                {content}
            </button>
        );
    },
}));

jest.mock('@/components/public/language-switcher/LanguageSwitcher', () => ({
    LanguageSwitcher: ({ onValueChange, className }: { onValueChange?: () => void; className?: string }) => (
        <button data-testid="mock-lang-switcher" className={className} onClick={onValueChange}>
            Switch Lang
        </button>
    ),
}));
jest.mock('react-i18next', () => {
    const headerUk = require('@/locales/uk/header.json');

    return {
        useTranslation: () => ({
            t: (key: string) => headerUk[key] ?? key,
        }),
    };
});

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => ({ currentLanguage: 'uk' }),
}));

describe('Header', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders the logo inside a link to "/"', () => {
        render(<Header />, { wrapper: MemoryRouter });
        expect(screen.getByRole('link', { name: '' })).toHaveAttribute('href', '/');
        expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    it('renders nav links with correct text and href', () => {
        render(<Header />, { wrapper: MemoryRouter });
        expect(screen.getByRole('link', { name: headerUk['REPORTING'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.REPORTS.FULL,
        );
        expect(screen.getByRole('link', { name: headerUk['HOW_TO_SUPPORT'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
        expect(screen.getByRole('link', { name: headerUk['STORIES_OF_VICTORIES'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
    });

    it('renders Contact Us and Donate buttons', () => {
        render(<Header />, { wrapper: MemoryRouter });

        expect(screen.getByRole('button', { name: headerUk['CONTACT_US'] })).toBeInTheDocument();
        const donateLink = screen.getByRole('link', { name: headerUk['DONATE'] });
        expect(donateLink).toBeInTheDocument();
        expect(donateLink).toHaveAttribute('href', PUBLIC_ROUTES.DONATE.FULL);
    });

    it('check if Contact Us button is clicked', () => {
        render(<Header />, { wrapper: MemoryRouter });

        const contactUsBtn = screen.getByRole('button', { name: headerUk['CONTACT_US'] });
        fireEvent.click(contactUsBtn);

        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith('CONTACT USED!');
    });

    it('renders burger menu correctly', () => {
        render(<Header />, { wrapper: MemoryRouter });

        const burgerMenuButton = screen.getByTestId('burger-icon').closest('button');

        expect(document.querySelector('.mobile-menu')).not.toBeInTheDocument();
        fireEvent.click(burgerMenuButton!);
        expect(document.querySelector('.mobile-menu')).toBeInTheDocument();
    });

    it('closes mobile menu when a link inside it is clicked', () => {
        render(<Header />, { wrapper: MemoryRouter });

        const burgerMenuButton = screen.getByTestId('burger-icon').closest('button');
        fireEvent.click(burgerMenuButton!);

        const mobileMenu = document.querySelector('.mobile-menu');
        expect(mobileMenu).toBeInTheDocument();

        const aboutUsLink = within(mobileMenu as HTMLElement).getByText(headerUk['ABOUT_US']);

        fireEvent.click(aboutUsLink);

        expect(mobileMenu).not.toBeInTheDocument();
    });

    it('closes mobile menu when language is switched in mobile menu', () => {
        render(<Header />, { wrapper: MemoryRouter });

        const burgerMenuButton = screen.getByTestId('burger-icon').closest('button');
        fireEvent.click(burgerMenuButton!);

        const mobileMenu = document.querySelector('.mobile-menu');

        const langSwitcher = within(mobileMenu as HTMLElement).getByTestId('mock-lang-switcher');

        fireEvent.click(langSwitcher);

        expect(mobileMenu).not.toBeInTheDocument();
    });

    it('passes correct links to DropdownMenu components', () => {
        render(<Header />, { wrapper: MemoryRouter });

        const dropdowns = screen.getAllByTestId('dropdown-mock');
        expect(dropdowns).toHaveLength(2);

        const aboutUsDropdown = dropdowns.find((d) => d.textContent?.includes(headerUk['ABOUT_US']));
        expect(aboutUsDropdown).toBeInTheDocument();

        const teamLink = within(aboutUsDropdown as HTMLElement).getByText(headerUk['TEAM']);
        expect(teamLink).toBeInTheDocument();
        expect(teamLink).toHaveAttribute('data-disabled', 'false');

        const historyLink = within(aboutUsDropdown as HTMLElement).getByText(headerUk['HISTORY']);
        expect(historyLink).toHaveAttribute('data-disabled', 'true');

        const programsDropdown = dropdowns.find((d) => d.textContent?.includes(headerUk['HIPPOTHERAPY']));
        expect(programsDropdown).toBeInTheDocument();

        const programsLink = within(programsDropdown as HTMLElement).getByText(headerUk['PROGRAMS']);
        expect(programsLink).toHaveAttribute('data-disabled', 'false');

        const hippotherapyLink = within(programsDropdown as HTMLElement).getByRole('link', {
            name: headerUk['HIPPOTHERAPY'],
        });
        expect(hippotherapyLink).toHaveAttribute('data-disabled', 'false');

        const prorgamsSessionsLink = within(programsDropdown as HTMLElement).getByText(headerUk['PROGRAMS_SESSIONS']);
        expect(prorgamsSessionsLink).toHaveAttribute('data-disabled', 'true');
    });

    it('toggles mobile menu open and closed', () => {
        render(<Header />, { wrapper: MemoryRouter });

        const burgerMenuButton = screen.getByTestId('burger-icon').closest('button');

        fireEvent.click(burgerMenuButton!);
        expect(document.querySelector('.mobile-menu')).toBeInTheDocument();

        fireEvent.click(burgerMenuButton!);
        expect(document.querySelector('.mobile-menu')).not.toBeInTheDocument();
    });

    it('renders all mobile menu links when menu is open', () => {
        render(<Header />, { wrapper: MemoryRouter });

        const burgerMenuButton = screen.getByTestId('burger-icon').closest('button');
        fireEvent.click(burgerMenuButton!);

        const mobileMenu = document.querySelector('.mobile-menu');
        expect(mobileMenu).toBeInTheDocument();

        const aboutUsLink = within(mobileMenu as HTMLElement).getByText(headerUk['ABOUT_US']);
        expect(aboutUsLink).toHaveAttribute('href', PUBLIC_ROUTES.ABOUT_US.FULL);

        const reportingLink = within(mobileMenu as HTMLElement).getByText(headerUk['REPORTING']);
        expect(reportingLink).toHaveAttribute('href', PUBLIC_ROUTES.REPORTS.FULL);
    });

    it('renders desktop language switcher', () => {
        render(<Header />, { wrapper: MemoryRouter });

        const langSwitchers = screen.getAllByTestId('mock-lang-switcher');
        const desktopSwitcher = langSwitchers.find((switcher) => switcher.className.includes('language-switcher'));
        expect(desktopSwitcher).toBeInTheDocument();
    });

    it('renders both dropdown menus with correct main text', () => {
        render(<Header />, { wrapper: MemoryRouter });

        expect(screen.getByText(headerUk['ABOUT_US'])).toBeInTheDocument();
        expect(screen.getAllByText(headerUk['HIPPOTHERAPY'])).toHaveLength(2);
    });

    it('passes correct aboutUs links to first DropdownMenu', () => {
        render(<Header />, { wrapper: MemoryRouter });

        const dropdowns = screen.getAllByTestId('dropdown-mock');
        const aboutUsDropdown = dropdowns.find((d) => d.textContent?.includes(headerUk['WHO_WE_ARE']));

        expect(aboutUsDropdown).toBeInTheDocument();

        const whoWeAreLink = within(aboutUsDropdown as HTMLElement).getByText(headerUk['WHO_WE_ARE']);
        expect(whoWeAreLink).toHaveAttribute('href', PUBLIC_ROUTES.ABOUT_US.FULL);
        expect(whoWeAreLink).toHaveAttribute('data-disabled', 'false');

        const partnersLink = within(aboutUsDropdown as HTMLElement).getByText(headerUk['PARTNERS']);
        expect(partnersLink).toHaveAttribute('href', PUBLIC_ROUTES.PARTNERS.FULL);
        expect(partnersLink).toHaveAttribute('data-disabled', 'false');

        const eventsLink = within(aboutUsDropdown as HTMLElement).getByText(headerUk['EVENTS_AND_NEWS']);
        expect(eventsLink).toHaveAttribute('data-disabled', 'false');
    });

    it('renders header spacer element', () => {
        const { container } = render(<Header />, { wrapper: MemoryRouter });
        expect(container.querySelector('.header-spacer')).toBeInTheDocument();
    });
});
