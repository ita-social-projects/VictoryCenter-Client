import directorPhoto from '@/assets/images/history/director.png';
import volunteer1Photo from '@/assets/images/history/volunteer-1.png';
import military1Photo from '@/assets/images/history/military-1.png';
import paramedicPhoto from '@/assets/images/history/paramedic.png';
import military2Photo from '@/assets/images/history/military-2.png';
import volunteer2Photo from '@/assets/images/history/volunteer-2.png';
import { LineConfig } from '@/types/public/history-page';

export const YEAR_PATTERN = /^(\d{4}(?:[–—-]\d{4})?)\s*[—–-]\s*/;
export const YEAR_ONLY_PATTERN = /^(\d{4}(?:[–—-]\d{4})?)$/;

export const TIMELINE_DATES = [
    '09/2023',
    '10/2023',
    '11/2023',
    '12/2023',
    '01/2024',
    '02/2024',
    '03/2024',
    '04/2024',
    '05/2024',
    '06/2024',
    '07/2024',
    '08/2024',
    '09/2024',
    '10/2024',
    '11/2024',
    '12/2024',
    '01/2025',
    '02/2025',
];

export const HIGHLIGHTED_DATES: Record<string, LineConfig> = {
    '09/2023': {
        xl: 158,
        mobile: 158,
        showFrom: 'all',
        side: 'left',
        photo: {
            src: directorPhoto,
            nameKey: 'PHOTO_DIRECTOR_NAME',
            roleKey: 'PHOTO_DIRECTOR_ROLE',
            width: 265,
            height: 177,
            tabletWidth: 204,
            tabletHeight: 136,
            mobileWidth: 168,
            mobileHeight: 112,
            offsetX: -80,
        },
    },
    '12/2023': {
        xl: 480,
        mobile: 700,
        topAnchor: true,
        showFrom: 'all',
        side: 'right',
        photo: {
            src: volunteer1Photo,
            nameKey: 'PHOTO_VOLUNTEER_1_NAME',
            roleKey: 'PHOTO_VOLUNTEER_1_ROLE',
            width: 195,
            height: 130,
            tabletWidth: 195,
            tabletHeight: 130,
            mobileWidth: 179,
            mobileHeight: 120,
            offsetX: 30,
        },
    },
    '03/2024': {
        xl: 44,
        mobile: 44,
        showFrom: 'tablet',
        side: 'left',
        photo: {
            src: military1Photo,
            nameKey: 'PHOTO_MILITARY_1_NAME',
            roleKey: 'PHOTO_MILITARY_1_ROLE',
            width: 196,
            height: 131,
            tabletWidth: 196,
            tabletHeight: 131,
            offsetX: -25,
        },
    },
    '06/2024': {
        xl: 550,
        mobile: 700,
        showFrom: 'desktop',
        side: 'left',
        photo: {
            src: paramedicPhoto,
            nameKey: 'PHOTO_PARAMEDIC_NAME',
            roleKey: 'PHOTO_PARAMEDIC_ROLE',
            width: 192,
            height: 128,
            tabletWidth: 192,
            tabletHeight: 128,
            offsetX: -15,
        },
    },
    '09/2024': {
        xl: 40,
        mobile: 0,
        showFrom: 'desktop',
        side: 'left',
        photo: {
            src: military2Photo,
            nameKey: 'PHOTO_MILITARY_2_NAME',
            roleKey: 'PHOTO_MILITARY_2_ROLE',
            width: 247,
            height: 165,
            offsetX: -70,
        },
    },
    '12/2024': {
        xl: 450,
        mobile: 0,
        showFrom: 'desktop',
        side: 'left',
        photo: {
            src: volunteer2Photo,
            nameKey: 'PHOTO_VOLUNTEER_2_NAME',
            roleKey: 'PHOTO_VOLUNTEER_2_ROLE',
            width: 274,
            height: 183,
            offsetX: -55,
        },
    },
};
