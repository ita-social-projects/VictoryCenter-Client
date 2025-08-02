import React from 'react';
import { PAGE_TITLE } from '../../../const/donate-page/donate-page';
import './DonatePageIntro.scss';

export const DonatePageIntro = () => {
    const titleParts = PAGE_TITLE.split(' | ');

    if (titleParts.length < 2) {
        return (
            <div className="donatePageIntro">
                <h1>{PAGE_TITLE}</h1>
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
