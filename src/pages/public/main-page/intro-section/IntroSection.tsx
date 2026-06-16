import { MainIntroData } from '@/types/public/main-page';

interface IntroSectionProps {
    introData: MainIntroData;
    buttonHref: string;
}

export const IntroSection = ({ introData, buttonHref }: IntroSectionProps) => {
    void introData;
    void buttonHref;

    return null;
};
