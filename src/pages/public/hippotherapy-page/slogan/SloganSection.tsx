import { useTranslation } from 'react-i18next';
import './SloganSection.scss';

export const SloganSection = () => {
    const { t } = useTranslation('hippotherapy');

    return (
        <section>
            <h1 className="slogan" data-testid="slogan-section">
                <span className="highlight yellow">{t('SLOGAN.FIRST_HIGHLIGHT')}</span>
                {t('SLOGAN.FIRST_TEXT')}
                <br />
                <span>{t('SLOGAN.SECOND_TEXT')} </span>
                <span className="highlight blue">{t('SLOGAN.SECOND_HIGHLIGHT')} </span>
                {/* add a space between span text */}
                <span> </span>
                <span className="highlight blue">{t('SLOGAN.THIRD_HIGHLIGHT')}</span>
            </h1>
        </section>
    );
};
