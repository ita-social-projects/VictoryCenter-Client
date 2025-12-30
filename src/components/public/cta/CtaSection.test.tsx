import { render, screen } from '@testing-library/react';
import { CtaSection } from './CtaSection';
import { ComponentProps } from 'react';

jest.mock('./CtaSection.module.scss', () => ({
    root: 'root-class',
    content: 'content-class',
    title: 'title-class',
    description: 'description-class',
    actions: 'actions-class',
    button: 'button-class',
}));

jest.mock('@/components/public/ui/button', () => ({
    Button: ({ children, href, variant, className }: any) => (
        <a href={href} className={className} data-variant={variant} data-testid="mock-button">
            {children}
        </a>
    ),
}));

jest.mock('@/components/public/background-media', () => ({
    BackgroundMedia: ({ mediaUrl }: any) => <div data-testid="mock-bg-media" data-url={mediaUrl} />,
}));

jest.mock('@/components/common/safe-html', () => ({
    SafeHtml: ({ html, className, as }: any) => (
        <div data-testid="mock-safe-html" data-as={as} className={className}>
            {html}
        </div>
    ),
}));

describe('CtaSection', () => {
    type CtaProps = ComponentProps<typeof CtaSection>;
    const defaultButtons: CtaProps['buttons'] = [{ label: 'Donate', href: '/donate' }];
    const twoButtons: CtaProps['buttons'] = [
        { label: 'Donate', href: '/donate' },
        { label: 'Support', href: '/support' },
    ];

    it('renders the section structure with title and description', () => {
        render(
            <CtaSection
                title="Test Title"
                description="Test Description"
                mediaUrl="video.mp4"
                buttons={defaultButtons}
            />,
        );

        const media = screen.getByTestId('mock-bg-media');
        expect(media).toBeInTheDocument();
        expect(media).toHaveAttribute('data-url', 'video.mp4');

        const desc = screen.getByText('Test Description');
        expect(desc).toBeInTheDocument();
        expect(desc).toHaveClass('description-class');
    });

    it('renders title using SafeHtml with correct configuration', () => {
        const richTitle = 'We <b>Can</b>';
        render(<CtaSection title={richTitle} description="Desc" mediaUrl="video.mp4" buttons={defaultButtons} />);

        const safeHtml = screen.getByTestId('mock-safe-html');
        expect(safeHtml).toBeInTheDocument();
        expect(safeHtml).toHaveTextContent(richTitle);
        expect(safeHtml).toHaveClass('title-class');
        expect(safeHtml).toHaveAttribute('data-as', 'h2');
    });

    it('renders a single primary button correctly', () => {
        render(<CtaSection title="Title" description="Desc" mediaUrl="video.mp4" buttons={defaultButtons} />);

        const buttons = screen.getAllByTestId('mock-button');
        expect(buttons).toHaveLength(1);

        const btn = buttons[0];
        expect(btn).toHaveTextContent('Donate');
        expect(btn).toHaveAttribute('href', '/donate');
        expect(btn).toHaveClass('button-class');
        expect(btn).toHaveAttribute('data-variant', 'primary-light');
    });

    it('renders two buttons with correct variant logic (Primary -> Secondary)', () => {
        render(<CtaSection title="Title" description="Desc" mediaUrl="video.mp4" buttons={twoButtons} />);

        const buttons = screen.getAllByTestId('mock-button');
        expect(buttons).toHaveLength(2);

        expect(buttons[0]).toHaveTextContent('Donate');
        expect(buttons[0]).toHaveAttribute('data-variant', 'primary-light');

        expect(buttons[1]).toHaveTextContent('Support');
        expect(buttons[1]).toHaveAttribute('data-variant', 'secondary-light');
    });
});
