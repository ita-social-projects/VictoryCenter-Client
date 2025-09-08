import { ImageSectionProps } from './ImageSection';
import { ImageInputProps } from '../../../../../components/admin/image-input/ImageInput';
import { WHO_WE_ARE_TEXT } from '../../../../../const/admin/who-we-are';
import MainPageImage from '../../../../../assets/images/public/about-us-page/background.jpg';
import TeamPageImage from '../../../../../assets/images/public/about-us-page/our-team.jpg';
import { DescriptionSectionProps } from './DescriptionSection';

export const MainPageProps: Omit<ImageSectionProps, 'content' | 'onChange'> = {
    titleLimit: 50,
    descriptionLimit: 300,
    imageInputProps: {
        label: WHO_WE_ARE_TEXT.IMAGE.INPUT,
        subText: '1440x860',
        style: {
            width: '52.5625rem',
            height: '46.875rem',
            backgroundImage: `
        linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
        url(${MainPageImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        },
    },
};

export const TeamPageProps: Omit<ImageSectionProps, 'content' | 'onChange'> = {
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

export const WhatWeDoPageProps: Omit<DescriptionSectionProps, 'content' | 'onChange'> = {
    descriptionLimit: 300,
};
