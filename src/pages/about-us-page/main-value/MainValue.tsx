import './main-value.scss';
import { peopleData, MAIN_VALUE, MAIN_VALUE_DETAILS } from '../../../const/about-us-page/about-us-page';

export const MainValues = () => {
    return (
        <div className="main-values-block">
            <div className="main-values-title">
                <h2>
                    {MAIN_VALUE.FIRST_PART}
                    <span>{MAIN_VALUE.FIRST_HIGHLIGHT}</span>
                    {MAIN_VALUE.MIDDLE_PART} <br />
                    <span>{MAIN_VALUE.SECOND_HIGHLIGHT}</span>
                </h2>
            </div>
            <div className="people-block">
                {peopleData.map(({ img, alt, info, cardClass }, index) => (
                    <div key={`${alt}-${index}`} className={`people-card ${cardClass}`}>
                        <img src={img} alt={alt} />
                        <p className="people-info">{info}</p>
                    </div>
                ))}
            </div>
            <div className="summary-block">
                <h3 className="summary-text">
                    {MAIN_VALUE_DETAILS.FIRST_LINE} <br />
                    {MAIN_VALUE_DETAILS.SECOND_LINE} <br />
                    {MAIN_VALUE_DETAILS.THIRD_LINE}
                </h3>
            </div>
        </div>
    );
};
