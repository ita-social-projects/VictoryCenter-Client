import './MainValue.scss';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';

export const MainValues = () => {
    return (
        <div className="main-values-block">
            <div className="main-values-title">
                <h2>
                    {ABOUT_US_DATA.MAIN_VALUE.FIRST_PART}
                    <span>{ABOUT_US_DATA.MAIN_VALUE.FIRST_HIGHLIGHT}</span>
                    {ABOUT_US_DATA.MAIN_VALUE.MIDDLE_PART} <br />
                    <span>{ABOUT_US_DATA.MAIN_VALUE.SECOND_HIGHLIGHT}</span>
                </h2>
            </div>
            <div className="people-block">
                {ABOUT_US_DATA.PEOPLE_DATA.map(({ IMG, ALT, INFO, CARD_CLASS }, index) => (
                    <div key={`${ALT}-${index}`} className={`people-card ${CARD_CLASS}`}>
                        <img src={IMG} alt={ALT} />
                        <p className="people-info">{INFO}</p>
                    </div>
                ))}
            </div>
            <div className="summary-block">
                <h3 className="summary-text">
                    {ABOUT_US_DATA.MAIN_VALUE_DETAILS.FIRST_LINE} <br />
                    {ABOUT_US_DATA.MAIN_VALUE_DETAILS.SECOND_LINE} <br />
                    {ABOUT_US_DATA.MAIN_VALUE_DETAILS.THIRD_LINE}
                </h3>
            </div>
        </div>
    );
};
