import { TFunction } from 'i18next';
import { PUBLIC_ROUTES } from '../../../const/public/routes';
import { DropdownLink } from '../dropdown-menu/DropdownMenu';

export const getDropdownMenuLinks = (t: TFunction<'header', undefined>): DropdownLink[] => [
    { text: t('WHO_WE_ARE'), navigateTo: PUBLIC_ROUTES.ABOUT_US.FULL, isDisabled: false },
    { text: t('HISTORY'), navigateTo: '', isDisabled: true },
    { text: t('TEAM'), navigateTo: PUBLIC_ROUTES.TEAM.FULL, isDisabled: false },
    { text: t('PARTNERS'), navigateTo: PUBLIC_ROUTES.PARTNERS.FULL, isDisabled: false },
    { text: t('EVENTS_AND_NEWS'), navigateTo: '', isDisabled: true },
];

export const getMobileDropdownMenuLinks = (t: TFunction<'header', undefined>) => [
    {
        href: PUBLIC_ROUTES.ABOUT_US.FULL,
        title: t('ABOUT_US'),
    },
    {
        href: PUBLIC_ROUTES.PROGRAMS.FULL,
        title: t('PROGRAMS'),
    },
    {
        href: PUBLIC_ROUTES.MOCK.FULL,
        title: t('REPORTING'),
        disabled: true,
    },
    {
        href: PUBLIC_ROUTES.MOCK.FULL,
        title: t('HOW_TO_SUPPORT'),
        disabled: true,
    },
];
