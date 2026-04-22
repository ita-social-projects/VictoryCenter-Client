import { Image, ImageValues } from '../common/image';

export interface MainAboutUs {
    id: number;
    title: string;
    description: string;
}

export interface MainPartners {
    id: number;
    title: string;
    description: string;
}

export interface MainPage {
    id: number;
    title: string;
    description: string;
    image: Image | ImageValues | null;
    mainAboutUs: MainAboutUs | null;
    mainPartners: MainPartners | null;
}

export interface TitleBlockFormValues {
    title: string;
    description: string;
    image: Image | ImageValues | null;
}

export const TITLE_BLOCK_FORM_DEFAULTS: TitleBlockFormValues = {
    title: '',
    description: '',
    image: null,
};

export interface AboutUsBlockFormValues {
    title: string;
    description: string;
}

export const ABOUT_US_BLOCK_FORM_DEFAULTS: AboutUsBlockFormValues = {
    title: '',
    description: '',
};
