import React from 'react';
import './DonatePageIntro.scss';
import { useTranslation } from 'react-i18next';

export const DonatePageIntro = () => {
    const { t } = useTranslation('donatePage');
    const titleParts = t('DONATE_PAGE_TITLE').split(' | ');

    if (titleParts.length < 2) {
        return (
            <div className="donatePageIntro">
                <h1>{t('DONATE_PAGE_TITLE')}</h1>
            </div>
        );
    }

    return (
        <div className="donatePageIntro">
            <h1>
                {titleParts.map((part, index) => {
                    return (
                        <React.Fragment key={index}>
                            {part}
                            {index < titleParts.length - 1 && <br />}
                        </React.Fragment>
                    );
                })}
            </h1>
        </div>
    );
};
