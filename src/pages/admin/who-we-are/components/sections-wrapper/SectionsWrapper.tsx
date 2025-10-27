import { Content, WhoWeAreSection } from '../../../../../types/admin/who-we-are';
import { CardsSection } from '../sections/cards-section/CardsSection';
import { DescriptionSection } from '../sections/description-section/DescriptionSection';
import { ImageSection } from '../sections/image-block-section/ImageBlockSection';
import {
    MainPageProps,
    PeopleCardsProps,
    TeamPageProps,
    WhatWeDoPageProps,
    WhoWeSupportCardsProps,
} from '../sections/SectionsProps';
import { SectionType } from '../../../../../types/common/about-us';
import React from 'react';

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

    const contents: Record<SectionType, React.JSX.Element> = {
        [SectionType.Main]: (
            <ImageSection
                content={section.contents}
                onPublish={onPublish}
                onChange={onChange}
                setIsPublishButtonActive={(value) => setIsPublishButtonActive(value)}
                isPublishButtonActive={isPublishButtonActive}
                {...MainPageProps}
            />
        ),
        [SectionType.WhatWeDo]: (
            <DescriptionSection
                content={section.contents}
                onChange={onChange}
                onPublish={onPublish}
                setIsPublishButtonActive={(value) => setIsPublishButtonActive(value)}
                isPublishButtonActive={isPublishButtonActive}
                {...WhatWeDoPageProps}
            />
        ),
        [SectionType.WhoWeSupport]: (
            <CardsSection
                content={section.contents}
                onPublish={onPublish}
                onChange={onChange}
                setIsPublishButtonActive={(value) => setIsPublishButtonActive(value)}
                isPublishButtonActive={isPublishButtonActive}
                {...WhoWeSupportCardsProps}
            />
        ),
        [SectionType.People]: (
            <CardsSection
                content={section.contents}
                onPublish={onPublish}
                onChange={onChange}
                setIsPublishButtonActive={(value) => setIsPublishButtonActive(value)}
                isPublishButtonActive={isPublishButtonActive}
                {...PeopleCardsProps}
            />
        ),
        [SectionType.Team]: (
            <ImageSection
                content={section.contents}
                onChange={onChange}
                onPublish={onPublish}
                setIsPublishButtonActive={(value) => setIsPublishButtonActive(value)}
                isPublishButtonActive={isPublishButtonActive}
                {...TeamPageProps}
            />
        ),
    };

    return <div className="who-we-are-main-section">{contents[section.sectionType] || null}</div>;
};
