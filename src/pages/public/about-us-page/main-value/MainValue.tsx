import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import './MainValue.scss';
import { CustomSwiper } from '../../../../components/public/swiper/CustomSwiper';
import { AboutUsContent } from '../../../../types/public/about-us-page';

export interface MainValuesProps {
    content: AboutUsContent[] | null;
}

export const MainValues = ({ content }: MainValuesProps) => {
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
                    items={content}
                    slidesPerView={1}
                    breakpoints={{
                        568: { slidesPerView: 2 },
                        768: { slidesPerView: 2 },
                        1025: { slidesPerView: 4 },
                    }}
                    renderItem={(person, index) => {
                        const imageUrl = person.image?.url ?? ABOUT_US_DATA.PEOPLE_DATA[index].IMG;
                        const altText = ABOUT_US_DATA.PEOPLE_DATA[index].ALT;
                        const description = person.description;

                        return (
                            <div className={`people-card card-${index + 1}`}>
                                <img src={imageUrl} alt={altText} />
                                <p className="people-info">{description}</p>
                            </div>
                        );
                    }}
                />
            </div>
            <div className="summary-block">
                <h3 className="summary-text">{ABOUT_US_DATA.MAIN_VALUE_DETAILS}</h3>
            </div>
        </div>
    );
};
