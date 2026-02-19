import { ImageSectionProps } from './image-block-section/ImageBlockSection';
import { IMAGE_CONFIGS, WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import MainPageImage from '@/assets/images/public/about-us-page/background.jpg';
import TeamPageImage from '@/assets/images/public/about-us-page/our-team.jpg';
import SupportVeterans from '@/assets/images/public/about-us-page/support-veterans.jpg';
import SupportVolunteers from '@/assets/images/public/about-us-page/support-volunteers.jpg';
import SupportChildren from '@/assets/images/public/about-us-page/support-children.jpg';
import ManAndHorse from '@/assets/images/public/about-us-page/man-horse.jpg';
import GirlAndHorse from '@/assets/images/public/about-us-page/girl-horse.jpg';
import OldManAndHorse from '@/assets/images/public/about-us-page/old-man-horse.jpg';
import WomanAndHorse from '@/assets/images/public/about-us-page/woman-horse.jpg';
import { DescriptionSectionProps } from './description-section/DescriptionSection';
import { CardsSectionProps } from './cards-section/CardsSection';

type OmittedProps =
    | 'content'
    | 'onChange'
    | 'onPublish'
    | 'setIsPublishButtonActive'
    | 'isPublishButtonActive'
    | 'language';

export type WhoWeAreImageConfigParams = {
    cropWidth: number;
    cropHeight: number;
    minWidth: number;
    minHeight: number;
    displayWidth?: number;
    displayHeight?: number;
};

const createImageConfig = (
    imageUrl: string,
    { cropWidth, cropHeight, minWidth, minHeight, displayWidth, displayHeight }: WhoWeAreImageConfigParams,
    backgroundPosition: string = 'center',
) => ({
    style: {
        width: `${displayWidth || cropWidth}px`,
        height: `${displayHeight || cropHeight}px`,
        backgroundImage: `linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)), url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition,
    },
    subText: `${cropWidth}x${cropHeight}`,
    cropWidth,
    cropHeight,
    minWidth,
    minHeight,
});

export const MainPageProps: Omit<ImageSectionProps, OmittedProps> = {
    titleLimit: 50,
    descriptionLimit: 300,
    rows: 5,
    imageInputProps: createImageConfig(MainPageImage, IMAGE_CONFIGS.MAIN_PAGE),
};

export const TeamPageProps: Omit<ImageSectionProps, OmittedProps> = {
    descriptionLimit: 400,
    rows: 7,
    imageInputProps: createImageConfig(TeamPageImage, IMAGE_CONFIGS.TEAM_PAGE),
};

export const WhatWeDoPageProps: Omit<DescriptionSectionProps, OmittedProps> = {
    descriptionLimit: 300,
};

export const WhoWeSupportCardsProps: Omit<CardsSectionProps, OmittedProps> = {
    descriptionLimit: 300,
    titleText: WHO_WE_ARE_TEXT.WHO_WE_SUPPORT,
    rows: 6,
    cardImageConfigs: [
        createImageConfig(SupportVeterans, IMAGE_CONFIGS.WHO_WE_SUPPORT_CARDS),
        createImageConfig(SupportVolunteers, IMAGE_CONFIGS.WHO_WE_SUPPORT_CARDS),
        createImageConfig(SupportChildren, IMAGE_CONFIGS.WHO_WE_SUPPORT_CARDS),
    ],
};

export const PeopleCardsProps: Omit<CardsSectionProps, OmittedProps> = {
    descriptionLimit: 60,
    rows: 2,
    cardImageConfigs: [
        createImageConfig(ManAndHorse, IMAGE_CONFIGS.PEOPLE_CARDS),
        createImageConfig(GirlAndHorse, IMAGE_CONFIGS.PEOPLE_CARDS),
        createImageConfig(OldManAndHorse, IMAGE_CONFIGS.PEOPLE_CARDS, 'right'),
        createImageConfig(WomanAndHorse, IMAGE_CONFIGS.PEOPLE_CARDS),
    ],
};
