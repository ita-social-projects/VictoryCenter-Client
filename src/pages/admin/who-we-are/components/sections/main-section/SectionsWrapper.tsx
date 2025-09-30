import { Content, WhoWeAreSection } from '../../../../../../types/admin/who-we-are';
import { SectionType } from '../../../../../../types/common/about-us';
import { CardsSection } from '../cards-section/CardsSection';
import { DescriptionSection } from '../description-section/DescriptionSection';
import { ImageSection } from '../image-block-section/ImageBlockSection';
import {
    MainPageProps,
    PeopleCardsProps,
    TeamPageProps,
    WhatWeDoPageProps,
    WhoWeSupportCardsProps,
} from '../SectionsProps';

interface MainSectionProps {
    section: WhoWeAreSection | null;

    onChange: (data: Content) => void;
    onPublish: () => void;
    isPublishButtonActive: boolean;
    setIsPublishButtonActive: (value: boolean) => void;
}

export const SectionsWrapper = ({
    section,
    onChange,
    onPublish,
    setIsPublishButtonActive,
    isPublishButtonActive,
}: MainSectionProps) => {
    if (!section) {
        return null;
    }

    let renderedContent;

    switch (section.sectionType) {
        case SectionType.WhatWeDo:
            renderedContent = (
                <DescriptionSection
                    content={section.contents}
                    onChange={onChange}
                    onPublish={onPublish}
                    setIsPublishButtonActive={(value) => setIsPublishButtonActive(value)}
                    isPublishButtonActive={isPublishButtonActive}
                    {...WhatWeDoPageProps}
                />
            );
            break;
        case SectionType.WhoWeSupport:
            renderedContent = (
                <CardsSection
                    content={section.contents}
                    onPublish={onPublish}
                    onChange={onChange}
                    setIsPublishButtonActive={(value) => setIsPublishButtonActive(value)}
                    isPublishButtonActive={isPublishButtonActive}
                    {...WhoWeSupportCardsProps}
                />
            );
            break;
        case SectionType.People:
            renderedContent = (
                <CardsSection
                    content={section.contents}
                    onPublish={onPublish}
                    onChange={onChange}
                    setIsPublishButtonActive={(value) => setIsPublishButtonActive(value)}
                    isPublishButtonActive={isPublishButtonActive}
                    {...PeopleCardsProps}
                />
            );
            break;
        case SectionType.Main:
            renderedContent = (
                <ImageSection
                    content={section.contents}
                    onPublish={onPublish}
                    onChange={onChange}
                    setIsPublishButtonActive={(value) => setIsPublishButtonActive(value)}
                    isPublishButtonActive={isPublishButtonActive}
                    {...MainPageProps}
                />
            );
            break;

        case SectionType.Team:
            renderedContent = (
                <ImageSection
                    content={section.contents}
                    onChange={onChange}
                    onPublish={onPublish}
                    setIsPublishButtonActive={(value) => setIsPublishButtonActive(value)}
                    isPublishButtonActive={isPublishButtonActive}
                    {...TeamPageProps}
                />
            );
            break;
        // Додайте інші case-и, якщо вони є
        default:
            renderedContent = null;
    }

    return <div className="who-we-are-main-section">{renderedContent}</div>;
};
