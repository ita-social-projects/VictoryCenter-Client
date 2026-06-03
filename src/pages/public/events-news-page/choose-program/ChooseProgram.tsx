import { CtaSection } from '@/components/public/cta';
import background from '@/assets/images/horse-and-girl.webp';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { useTranslation } from 'react-i18next';
import { chooseProgramData } from '@/types/public/events-news';

export const ChooseProgram = ({ title, description, imgURL }: chooseProgramData) => {
    const { t } = useTranslation('eventsNewsPage');
    return (
        <section>
            <CtaSection
                title={title}
                description={description}
                mediaUrl={imgURL ?? background}
                buttons={[
                    { label: t('CHOOSE_PROGRAM'), href: PUBLIC_ROUTES.PROGRAMS.FULL },
                    { label: t('SUPPORT'), href: PUBLIC_ROUTES.DONATE.FULL },
                ]}
            />
        </section>
    );
};
