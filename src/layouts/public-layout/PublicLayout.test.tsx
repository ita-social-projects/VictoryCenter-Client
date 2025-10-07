import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router';
import userEvent from '@testing-library/user-event';
import { PublicLayout } from './PublicLayout';

jest.mock('../../components/public/header/Header', () => ({
    Header: () => <header>Mock Header</header>,
}));

jest.mock('../../components/public/footer/Footer', () => ({
    Footer: () => <footer>Mock Footer</footer>,
}));

const scrollToSpy = jest.fn();
Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: scrollToSpy,
});

describe('PublicLayout Component', () => {
    beforeEach(() => {
        scrollToSpy.mockClear();
    });

    const HomePage = () => <div>Home Page Content</div>;
    const AboutPage = () => <div>About Page Content</div>;

    test('should render Header, Footer, and the page content via Outlet', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<PublicLayout />}>
                        <Route index element={<HomePage />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Mock Header')).toBeInTheDocument();
        expect(screen.getByText('Mock Footer')).toBeInTheDocument();

        expect(screen.getByText('Home Page Content')).toBeInTheDocument();
    });

    test('should scroll to top on initial render with default "auto" behavior', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <PublicLayout />
            </MemoryRouter>
        );

        expect(scrollToSpy).toHaveBeenCalledTimes(1);

        expect(scrollToSpy).toHaveBeenCalledWith({
            top: 0,
            behavior: 'auto',
        });
    });

    test('should scroll to top with "smooth" behavior when prop is provided', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <PublicLayout behavior="smooth" />
            </MemoryRouter>
        );

        expect(scrollToSpy).toHaveBeenCalledTimes(1);

        expect(scrollToSpy).toHaveBeenCalledWith({
            top: 0,
            behavior: 'smooth',
        });
    });

    test('should scroll to top again when the route changes', async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
                </nav>
                <Routes>
                    <Route path="/" element={<PublicLayout />}>
                        <Route index element={<HomePage />} />
                        <Route path="about" element={<AboutPage />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Home Page Content')).toBeInTheDocument();
        expect(scrollToSpy).toHaveBeenCalledTimes(1);
        expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });

        const aboutLink = screen.getByRole('link', { name: /about/i });
        await userEvent.click(aboutLink);

        expect(screen.getByText('About Page Content')).toBeInTheDocument();
        expect(scrollToSpy).toHaveBeenCalledTimes(2);
    });
});