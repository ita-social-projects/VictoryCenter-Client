import { ABOUT_US_DATA } from '../../../../../const/public/about-us-page';
import { AboutUsContent } from '../../../../../types/public/about-us-page';

export interface SupportSectionResponsiveProps {
    content: AboutUsContent[] | null;
}

export const SupportSectionResponsive = ({ content }: SupportSectionResponsiveProps) => {
    if (!content) return null;

    const renderColumn = (side: 'left' | 'right') => {
        const isLeft = side === 'left';

        return (
            <div className={`support-col ${side}`}>
                {content
                    .filter((_, index) => index % 2 === (isLeft ? 0 : 1))
                    .map((item, columnIndex) => {
                        const generalIndex = isLeft ? columnIndex * 2 : columnIndex * 2 + 1;

                        const imageUrl = item.image?.url ?? ABOUT_US_DATA.SUPPORT_DATA[generalIndex].IMG;
                        const altText = ABOUT_US_DATA.SUPPORT_DATA[generalIndex].ALT;
                        const description = item.description;

                        return (
                            <div
                                key={`${altText}-${side}-${columnIndex}`}
                                className={`support-card card-${columnIndex + 1}`}
                            >
                                <img src={imageUrl} alt={altText} />
                                <p className="support-description">{description}</p>
                            </div>
                        );
                    })}
            </div>
        );
    };

    return (
        <div className="support-block">
            <div className="main-values-title">
                <h2 className="support-title">{ABOUT_US_DATA.SUPPORT_TITLE}</h2>
            </div>

            <div className="support-columns">
                {renderColumn('left')}
                {renderColumn('right')}
            </div>
        </div>
    );
};
