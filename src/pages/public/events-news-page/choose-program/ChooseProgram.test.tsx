import { render } from '@testing-library/react';
import { ChooseProgram } from './ChooseProgram';
import { chooseProgramData } from '@/types/public/events-news';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { CtaSection } from '@/components/public/cta';
import background from '@/assets/images/horse-and-girl.webp';

jest.mock('@/components/public/cta', () => ({
    CtaSection: jest.fn(() => null),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('ChooseProgram', () => {
    const mockData: chooseProgramData = {
        title: 'Choose a program',
        description: 'Select a hippotherapy program that fits your needs',
        imgURL: 'https://example.com/choose-program.jpg',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render CtaSection with correct props', () => {
        render(<ChooseProgram {...mockData} />);

        expect(CtaSection).toHaveBeenCalledTimes(1);
        expect(CtaSection).toHaveBeenCalledWith(
            expect.objectContaining({
                title: mockData.title,
                description: mockData.description,
                mediaUrl: mockData.imgURL,
                buttons: [
                    { label: 'CHOOSE_PROGRAM', href: PUBLIC_ROUTES.PROGRAMS.FULL },
                    { label: 'SUPPORT', href: PUBLIC_ROUTES.DONATE.FULL },
                ],
            }),
            undefined,
        );
    });

    it('should fallback to the default background when imgURL is not provided', () => {
        const propsWithoutImgURL = { ...mockData, imgURL: undefined };
        render(<ChooseProgram {...propsWithoutImgURL} />);

        expect(CtaSection).toHaveBeenCalledWith(
            expect.objectContaining({
                mediaUrl: background,
            }),
            undefined,
        );
    });
});
