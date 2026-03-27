import { CompanyProfile, LocalizationLanguage } from '@/types/admin/company-profile';

export const mockCompanyProfile: CompanyProfile = {
    id: 1,
    contact: {
        id: 1,
        profileId: 1,
        phone: '+380 67 123 45 67',
        address: 'м. Київ, вул. Хрещатик, 1',
        email: 'info@victorycenter.online',
        correspondenceEmail: 'office@victorycenter.online',
        motto: 'Разом до перемоги',
        localizations: [
            {
                entityId: 1,
                languageId: 1,
                language: { id: 1, code: 'uk', name: 'Ukrainian' },
                address: 'м. Київ, вул. Хрещатик, 1',
                motto: 'Разом до перемоги',
            },
            {
                entityId: 1,
                languageId: 2,
                language: { id: 2, code: 'en', name: 'English' },
                address: 'Kyiv, Khreshchatyk str., 1',
                motto: 'Together to victory',
            },
        ],
    },
    requisite: {
        id: 1,
        profileId: 1,
        recipient: 'БО "Вікторі Центр"',
        edrpou: '12345678',
        address: 'м. Київ, вул. Хрещатик, 1',
        localizations: [
            {
                entityId: 1,
                languageId: 1,
                language: { id: 1, code: 'uk', name: 'Ukrainian' },
                recipient: 'БО "Вікторі Центр"',
                address: 'м. Київ, вул. Хрещатик, 1',
            },
            {
                entityId: 1,
                languageId: 2,
                language: { id: 2, code: 'en', name: 'English' },
                recipient: 'Victory Center NGO',
                address: 'Kyiv, Khreshchatyk str., 1',
            },
        ],
    },
    socialLinks: [
        { id: 1, profileId: 1, socialPlatform: 'Instagram', url: 'https://instagram.com/victorycenter' },
        { id: 2, profileId: 1, socialPlatform: 'Facebook', url: 'https://facebook.com/victorycenter' },
    ],
};

export const mockCompanyProfileLanguages: LocalizationLanguage[] = [
    { id: 1, code: 'uk', name: 'Ukrainian' },
    { id: 2, code: 'en', name: 'English' },
];
