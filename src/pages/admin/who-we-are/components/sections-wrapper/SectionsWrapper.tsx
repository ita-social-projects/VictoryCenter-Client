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
import { LocalizationLanguage } from '@/types/common/language';
import './SectionsWrapper.scss';

export interface MainSectionProps {
    section: WhoWeAreSection | null;
    onChange: (data: Content) => void;
    handleOnTranslateContent: (section: WhoWeAreSection) => void;
    onPublish: () => void;
    isPublishButtonActive: boolean;
    language: LocalizationLanguage;
}

interface SectionConfig {
    component: React.ComponentType<any>;
    additionalProps: Record<string, any>;
}

export const SectionsWrapper = ({
    section,
    onChange,
    handleOnTranslateContent,
    onPublish,
    isPublishButtonActive,
    language,
}: MainSectionProps) => {
    if (!section) {
        return null;
    }

    const commonProps = {
        content: section.contents,
        onChange,
        onPublish,
        isPublishButtonActive,
        language,
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
            <div className="who-we-are-section-buttons">
                <button
                    type="button"
                    className="who-we-are-translate-btn"
                    aria-label="Translate"
                    onClick={() => handleOnTranslateContent(section)}
                />
            </div>
            <Component {...commonProps} {...additionalProps} />
        </div>
    );
};
