import { ImageSectionProps } from './image-block-section/ImageBlockSection';
import { WHO_WE_ARE_TEXT } from '../../../../../const/admin/who-we-are';
import MainPageImage from '../../../../../assets/images/public/about-us-page/background.jpg';
import TeamPageImage from '../../../../../assets/images/public/about-us-page/our-team.jpg';
import SupportVeterans from '../../../../../assets/images/public/about-us-page/support-veterans.jpg';
import SupportVolunteers from '../../../../../assets/images/public/about-us-page/support-volunteers.jpg';
import SupportChildren from '../../../../../assets/images/public/about-us-page/support-children.jpg';
import ManAndHorse from '../../../../../assets/images/public/about-us-page/men-horse.jpg';
import GirlAndHorse from '../../../../../assets/images/public/about-us-page/girl-horse.jpg';
import OldManAndHorse from '../../../../../assets/images/public/about-us-page/old-men-horse.jpg';
import WomanAndHorse from '../../../../../assets/images/public/about-us-page/women-horse.jpg';
import { DescriptionSectionProps } from './description-section/DescriptionSection';
import { CardsSectionProps } from './cards-section/CardsSection';

export const MainPageProps: Omit<
    ImageSectionProps,
    'content' | 'onChange' | 'onPublish' | 'setIsPublishButtonActive' | 'isPublishButtonActive'
> = {
    titleLimit: 50,
    descriptionLimit: 300,
    rows: 5,
    imageInputProps: {
        subText: '1440x860',
        width: 1440,
        height: 860,
        style: {
            width: '52.5625rem',
            height: '33.125rem',
            backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${MainPageImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        },
    },
};

export const TeamPageProps: Omit<
    ImageSectionProps,
    'content' | 'onChange' | 'onPublish' | 'setIsPublishButtonActive' | 'isPublishButtonActive'
> = {
    descriptionLimit: 360,
    rows: 6,
    imageInputProps: {
        subText: '840x750',
        width: 840,
        height: 750,
        style: {
            width: '52.5625rem',
            height: '46.875rem',
            backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${TeamPageImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        },
    },
};

export const WhatWeDoPageProps: Omit<
    DescriptionSectionProps,
    'content' | 'onChange' | 'onPublish' | 'setIsPublishButtonActive' | 'isPublishButtonActive'
> = {
    descriptionLimit: 300,
};

export interface CardImageConfig {
    style: React.CSSProperties;
    subText: string;
    width: number;
    height: number;
}

export const WhoWeSupportCardsProps: Omit<
    CardsSectionProps,
    'content' | 'onChange' | 'onPublish' | 'setIsPublishButtonActive' | 'isPublishButtonActive'
> = {
    descriptionLimit: 200,
    titleText: WHO_WE_ARE_TEXT.WHO_WE_SUPPORT,
    rows: 5,
    cardImageConfigs: [
        // first card
        {
            style: {
                width: '31.6875rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${SupportVeterans})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '500x430',
            width: 500,
            height: 430,
        },
        // second card
        {
            style: {
                width: '26.875rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${SupportVolunteers})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '500x430',
            width: 500,
            height: 430,
        },
        // third card
        {
            style: {
                width: '31.5rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${SupportChildren})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '500x430',
            width: 500,
            height: 430,
        },
    ],
};

export const PeopleCardsProps: Omit<
    CardsSectionProps,
    'content' | 'onChange' | 'onPublish' | 'setIsPublishButtonActive' | 'isPublishButtonActive'
> = {
    descriptionLimit: 200,
    cardImageConfigs: [
        // first card
        {
            style: {
                width: '24rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${ManAndHorse})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '380x430',
            width: 380,
            height: 430,
        },
        // second card
        {
            style: {
                width: '21rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${GirlAndHorse})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '330x430',
            width: 330,
            height: 430,
        },
        // third card
        {
            style: {
                width: '21rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${OldManAndHorse})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '330x430',
            width: 330,
            height: 430,
        },
        // fourth card
        {
            style: {
                width: '24rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${WomanAndHorse})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '380x430',
            width: 380,
            height: 430,
        },
    ],
};
