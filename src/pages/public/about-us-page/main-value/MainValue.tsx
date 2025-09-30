import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import './MainValue.scss';
import { CustomSwiper } from '../../../../components/public/swiper/CustomSwiper';

export const MainValues = () => {
    return (
        <div className="main-values-block">
            <div className="main-values-title">
                <h2>
                    {ABOUT_US_DATA.MAIN_VALUE.FIRST_PART} <br />
                    <span>{ABOUT_US_DATA.MAIN_VALUE.FIRST_HIGHLIGHT}</span> <br />
                    {ABOUT_US_DATA.MAIN_VALUE.MIDDLE_PART} <br />
                    <span>{ABOUT_US_DATA.MAIN_VALUE.SECOND_HIGHLIGHT}</span>
                </h2>
            </div>

            <div className="people-block">
                <CustomSwiper
                    items={ABOUT_US_DATA.PEOPLE_DATA}
                    slidesPerView={1}
                    breakpoints={{
                        568: { slidesPerView: 2 },
                        768: { slidesPerView: 2 },
                        912: { slidesPerView: 4 },
                    }}
                    renderItem={(person, index) => (
                        <>
                            <div className={`people-card card-${index + 1}`}>
                                <img src={person.IMG} alt={person.ALT} />
                                <p className="people-info">{person.INFO}</p>
                            </div>
                        </>
                    )}
                />
            </div>
            <div className="summary-block">
                <h3 className="summary-text">{ABOUT_US_DATA.MAIN_VALUE_DETAILS}</h3>
            </div>
        </div>
    );
};
