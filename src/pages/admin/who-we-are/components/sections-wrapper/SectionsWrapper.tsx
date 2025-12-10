import { Content, WhoWeAreSection } from '@/types/admin/who-we-are';
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
import { SectionType } from '@/types/common/about-us';
import React from 'react';

export interface MainSectionProps {
    section: WhoWeAreSection | null;
    onChange: (data: Content) => void;
    onPublish: () => void;
    isPublishButtonActive: boolean;
    setIsPublishButtonActive: (value: boolean) => void;
}

interface SectionConfig {
    component: React.ComponentType<any>;
    additionalProps: Record<string, any>;
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

    const commonProps = {
        content: section.contents,
        onChange,
        onPublish,
        setIsPublishButtonActive,
        isPublishButtonActive,
    };

    const contentConfigs: Record<SectionType, SectionConfig> = {
        [SectionType.Main]: {
            component: ImageSection,
            additionalProps: MainPageProps,
        },
        [SectionType.WhatWeDo]: {
            component: DescriptionSection,
            additionalProps: WhatWeDoPageProps,
        },
        [SectionType.WhoWeSupport]: {
            component: CardsSection,
            additionalProps: WhoWeSupportCardsProps,
        },
        [SectionType.People]: {
            component: CardsSection,
            additionalProps: PeopleCardsProps,
        },
        [SectionType.Team]: {
            component: ImageSection,
            additionalProps: TeamPageProps,
        },
    };

    const config = contentConfigs[section.sectionType];

    if (!config) {
        return null;
    }

    const { component: Component, additionalProps } = config;

    return (
        <div className="who-we-are-main-section">
            <Component {...commonProps} {...additionalProps} />
        </div>
    );
};
