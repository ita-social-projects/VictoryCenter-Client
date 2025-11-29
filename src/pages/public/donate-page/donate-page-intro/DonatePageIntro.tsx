import React from 'react';
import styles from './DonatePageIntro.module.scss';
import { PAGE_TITLE } from '../../../../const/public/donate-page';

export const DonatePageIntro = () => {
    const titleParts = PAGE_TITLE.split(' | ');

    if (titleParts.length < 2) {
        return (
            <div className={styles['donatePageIntro']}>
                <h1>{PAGE_TITLE}</h1>
            </div>
        );
    }

    return (
        <div className={styles['donatePageIntro']}>
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
