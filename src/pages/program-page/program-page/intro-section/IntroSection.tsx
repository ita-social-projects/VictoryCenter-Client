import React from 'react';
import { ABOUT_PROGRAMS, VICTORY_CENTER_BELIEF, MAIN_TITLE } from '../../../../const/program-page/program-page';
import './intro-section.scss';

export const IntroSection: React.FC = () => {
    return (
        <div className="intro-section">
            <h1>
                {MAIN_TITLE.PREFIX}
                <span>{MAIN_TITLE.FIRST_HIGHLIGHT}</span>
                {MAIN_TITLE.MIDDLE}
                <span>{MAIN_TITLE.SECOND_HIGHLIGHT}</span>
            </h1>
            <div className="additional-info">
                <p>
                    {VICTORY_CENTER_BELIEF.FIRST_LINE}
                    <br />
                    {VICTORY_CENTER_BELIEF.SECOND_LINE}
                </p>
                <p>{ABOUT_PROGRAMS}</p>
            </div>
        </div>
    );
};
