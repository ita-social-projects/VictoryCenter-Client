import { ImageSectionProps } from './image-section/ImageSection';
import { ImageInputProps } from '../../../../../components/admin/image-input/ImageInput';
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

export const MainPageProps: Omit<ImageSectionProps, 'content' | 'onChange' | 'onPublish'> = {
    titleLimit: 50,
    descriptionLimit: 300,
    imageInputProps: {
        label: WHO_WE_ARE_TEXT.IMAGE.INPUT,
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

export const TeamPageProps: Omit<ImageSectionProps, 'content' | 'onChange' | 'onPublish'> = {
    descriptionLimit: 360,
    imageInputProps: {
        label: WHO_WE_ARE_TEXT.IMAGE.INPUT,
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

export const WhatWeDoPageProps: Omit<DescriptionSectionProps, 'content' | 'onChange' | 'onPublish'> = {
    descriptionLimit: 300,
};

export interface CardImageConfig {
    label: string;
    style: React.CSSProperties;
    subText: string;
}

export const WhoWeSupportCardsProps: Omit<CardsSectionProps, 'content' | 'onChange' | 'onPublish'> = {
    descriptionLimit: 200,
    titleLimit: 100,
    cardImageConfigs: [
        // first card
        {
            label: WHO_WE_ARE_TEXT.IMAGE.INPUT,
            style: {
                width: '31.6875rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${SupportVeterans})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '320x400',
        },
        // second card
        {
            label: WHO_WE_ARE_TEXT.IMAGE.INPUT,
            style: {
                width: '26.875rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${SupportVolunteers})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '320x400',
        },
        // third card
        {
            label: WHO_WE_ARE_TEXT.IMAGE.INPUT,
            style: {
                width: '31.5rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${SupportChildren})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '320x400',
        },
    ],
};

export const PeopleCardsProps: Omit<CardsSectionProps, 'content' | 'onChange' | 'onPublish'> = {
    descriptionLimit: 200,
    titleLimit: 100,
    cardImageConfigs: [
        // first card
        {
            label: WHO_WE_ARE_TEXT.IMAGE.INPUT,
            style: {
                width: '24rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${ManAndHorse})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '320x400',
        },
        // second card
        {
            label: WHO_WE_ARE_TEXT.IMAGE.INPUT,
            style: {
                width: '24rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${WomanAndHorse})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '320x400',
        },
        // third card
        {
            label: WHO_WE_ARE_TEXT.IMAGE.INPUT,
            style: {
                width: '24rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${GirlAndHorse})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '320x400',
        },
        // fourth card
        {
            label: WHO_WE_ARE_TEXT.IMAGE.INPUT,
            style: {
                width: '24rem',
                height: '26.875rem',
                backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${OldManAndHorse})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
            subText: '320x400',
        },
    ],
};
