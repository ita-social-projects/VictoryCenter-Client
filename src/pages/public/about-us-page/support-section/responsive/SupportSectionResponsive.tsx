import { ABOUT_US_DATA } from '../../../../../const/public/about-us-page';

export const SupportSectionResponsive = () => {
    return (
        <div className="support-block">
            <div className="main-values-title">
                <h2 className="support-title">{ABOUT_US_DATA.SUPPORT_TITLE}</h2>
            </div>

            <div className="support-columns">
                <div className="support-col left">
                    {ABOUT_US_DATA.SUPPORT_DATA.filter((_, index) => index % 2 === 0).map(
                        ({ IMG, ALT, DESCRIPTION }, index) => (
                            <div key={`${ALT}-left-${index}`} className={`support-card card-${index + 1}`}>
                                <img src={IMG} alt={ALT} />
                                <p className="support-description">{DESCRIPTION}</p>
                            </div>
                        ),
                    )}
                </div>
                <div className="support-col right">
                    {ABOUT_US_DATA.SUPPORT_DATA.filter((_, index) => index % 2 === 1).map(
                        ({ IMG, ALT, DESCRIPTION }, index) => (
                            <div key={`${ALT}-right-${index}`} className={`support-card card-${index + 1}`}>
                                <img src={IMG} alt={ALT} />
                                <p className="support-description">{DESCRIPTION}</p>
                            </div>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
};
