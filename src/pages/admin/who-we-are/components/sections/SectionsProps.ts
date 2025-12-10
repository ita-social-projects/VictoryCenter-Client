import { ImageSectionProps } from './image-block-section/ImageBlockSection';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
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

export const MainPageProps: Omit<
    ImageSectionProps,
    'content' | 'onChange' | 'onPublish' | 'setIsPublishButtonActive' | 'isPublishButtonActive'
> = {
    titleLimit: 50,
    descriptionLimit: 300,
    rows: 5,
    imageInputProps: {
        subText: '1440x860',
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
    descriptionLimit: 400,
    rows: 7,
    imageInputProps: {
        subText: '840x750',
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

export const WhoWeSupportCardsProps: Omit<
    CardsSectionProps,
    'content' | 'onChange' | 'onPublish' | 'setIsPublishButtonActive' | 'isPublishButtonActive'
> = {
    descriptionLimit: 300,
    titleText: WHO_WE_ARE_TEXT.WHO_WE_SUPPORT,
    rows: 6,
    cardImageConfigs: [
        // first card
        {
            style: {
                width: '30rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${SupportVeterans})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '500x430',
        },
        // second card
        {
            style: {
                width: '30rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${SupportVolunteers})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '500x430',
        },
        // third card
        {
            style: {
                width: '30rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${SupportChildren})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '500x430',
        },
    ],
};

export const PeopleCardsProps: Omit<
    CardsSectionProps,
    'content' | 'onChange' | 'onPublish' | 'setIsPublishButtonActive' | 'isPublishButtonActive'
> = {
    descriptionLimit: 60,
    rows: 2,
    cardImageConfigs: [
        // first card
        {
            style: {
                width: '22.5rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${ManAndHorse})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '360x430',
        },
        // second card
        {
            style: {
                width: '22.5rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${GirlAndHorse})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '360x430',
        },
        // third card
        {
            style: {
                width: '22.5rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${OldManAndHorse})`,
                backgroundSize: 'cover',
                backgroundPosition: 'right',
            },
            subText: '360x430',
        },
        // fourth card
        {
            style: {
                width: '22.5rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${WomanAndHorse})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '360x430',
        },
    ],
};
