// MainSection.tsx

import { Content, SectionType, WhoWeAreSection } from '../../../../../types/admin/who-we-are';
import { ImageInputProps } from '../../../../../components/admin/image-input/ImageInput';
import { WHO_WE_ARE_TEXT } from '../../../../../const/admin/who-we-are';
import { BaseContent } from '../base-content/BaseContent';
import React from 'react';
import { CardsSection } from './CardsSection';
import { DescriptionSection } from './DescriptionSection';
import { ImageSection } from './ImageSection';
import { MainPageProps, TeamPageProps, WhatWeDoPageProps } from './SectionsProps';

interface MainSectionProps {
    section: WhoWeAreSection | null;

    onChange: (data: Content) => void;
    className?: string;
}

export const MainSection = ({ section, onChange, className }: MainSectionProps) => {
    if (!section) {
        return null;
    }

    let renderedContent;

    switch (section.sectionType) {
        case SectionType.WhatWeDo:
            renderedContent = (
                <DescriptionSection content={section.contents} onChange={onChange} {...WhatWeDoPageProps} />
            );
            break;
        case SectionType.WhoWeSupport:
            renderedContent = (
                <CardsSection content={section.contents} onChange={onChange} descriptionLimit={200} titleLimit={100} />
            );
            break;
        case SectionType.People:
            renderedContent = (
                <CardsSection content={section.contents} onChange={onChange} descriptionLimit={200} titleLimit={100} />
            );
            break;
        case SectionType.Main:
            renderedContent = <ImageSection content={section.contents} onChange={onChange} {...MainPageProps} />;
            break;

        case SectionType.Team:
            renderedContent = <ImageSection content={section.contents} onChange={onChange} {...TeamPageProps} />;
            break;
        // Додайте інші case-и, якщо вони є
        default:
            renderedContent = null;
    }

    return <div className={className}>{renderedContent}</div>;
};
