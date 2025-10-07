import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SectionsWrapper } from './SectionsWrapper';
import { ContentType, SectionType } from '../../../../../types/common/about-us';
import {
    MainPageProps,
    PeopleCardsProps,
    TeamPageProps,
    WhatWeDoPageProps,
    WhoWeSupportCardsProps,
} from '../sections/SectionsProps';
import { Content } from '../../../../../types/admin/who-we-are';
import { Image } from '../../../../../types/common/image';

// Mock all child section components and their specific props
jest.mock('../sections/cards-section/CardsSection', () => ({
    CardsSection: (props: any) => {
        // Mock a change event to call the setIsPublishButtonActive prop
        props.setIsPublishButtonActive(true);
        return <div data-testid="cards-section" data-props={JSON.stringify(props)} />;
    },
}));
jest.mock('../sections/description-section/DescriptionSection', () => ({
    DescriptionSection: (props: any) => {
        // Mock a change event to call the setIsPublishButtonActive prop
        props.setIsPublishButtonActive(true);
        return <div data-testid="description-section" data-props={JSON.stringify(props)} />;
    },
}));
jest.mock('../sections/image-block-section/ImageBlockSection', () => ({
    ImageSection: (props: any) => {
        // Mock a change event to call the setIsPublishButtonActive prop
        props.setIsPublishButtonActive(true);
        return <div data-testid="image-section" data-props={JSON.stringify(props)} />;
    },
}));

const mockProps = {
    onChange: jest.fn(),
    onPublish: jest.fn(),
    isPublishButtonActive: false,
    setIsPublishButtonActive: jest.fn(),
};

describe('SectionsWrapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test case for SectionType.WhatWeDo
    it('should render DescriptionSection and call setIsPublishButtonActive', () => {
        const section = {
            id: 1,
            sectionType: SectionType.WhatWeDo,
            title: 'WhatWeDo',
            contents: [{ id: 10, title: 'What We Do Title' }] as Content[],
        };
        render(<SectionsWrapper {...mockProps} section={section} />);

        expect(screen.getByTestId('description-section')).toBeInTheDocument();
        expect(mockProps.setIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    // Test case for SectionType.WhoWeSupport
    it('should render CardsSection and call setIsPublishButtonActive for WhoWeSupport', () => {
        const section = {
            id: 2,
            sectionType: SectionType.WhoWeSupport,
            title: 'WhoWeSupport',
            contents: [{ id: 20, description: 'Who We Support Desc' }] as Content[],
        };
        render(<SectionsWrapper {...mockProps} section={section} />);

        expect(screen.getByTestId('cards-section')).toBeInTheDocument();
        expect(mockProps.setIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    // Test case for SectionType.People
    it('should render CardsSection and call setIsPublishButtonActive for People', () => {
        const section = {
            id: 3,
            sectionType: SectionType.People,
            title: 'People',
            contents: [{ id: 30, contentType: ContentType.Description, description: 'People Desc' }] as Content[],
        };
        render(<SectionsWrapper {...mockProps} section={section} />);

        expect(screen.getByTestId('cards-section')).toBeInTheDocument();
        expect(mockProps.setIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    // Test case for SectionType.Main
    it('should render ImageSection and call setIsPublishButtonActive for Main', () => {
        const section = {
            id: 4,
            sectionType: SectionType.Main,
            title: 'Main Section',
            contents: [{ id: 40, image: { id: 1, url: 'main.jpg', mimeType: 'image/png' } as Image }] as Content[],
        };
        render(<SectionsWrapper {...mockProps} section={section} />);

        expect(screen.getByTestId('image-section')).toBeInTheDocument();
        expect(mockProps.setIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    // Test case for SectionType.Team
    it('should render ImageSection and call setIsPublishButtonActive for Team', () => {
        const section = {
            id: 5,
            sectionType: SectionType.Team,
            title: 'Team Section',
            contents: [{ id: 50, image: { id: 1, url: 'team.jpg', mimeType: 'image/png' } as Image }] as Content[],
        };
        render(<SectionsWrapper {...mockProps} section={section} />);

        expect(screen.getByTestId('image-section')).toBeInTheDocument();
        expect(mockProps.setIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    // Test for a null section
    it('should not render anything if the section prop is null', () => {
        const { container } = render(<SectionsWrapper {...mockProps} section={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    // Test for an unknown section type
    it('should render the wrapper but no child section for an unknown section type', () => {
        const section = {
            id: 6,
            sectionType: 'unknown' as unknown as SectionType,
            title: 'Null',
            contents: [],
        };
        const { container } = render(<SectionsWrapper {...mockProps} section={section} />);
        expect(container.firstChild).toHaveClass('who-we-are-main-section');
        expect(container.firstChild).toBeEmptyDOMElement();
        expect(mockProps.setIsPublishButtonActive).not.toHaveBeenCalled();
    });
});
