import { ContactUsPageContent } from '@/types/public/company-profile';

type ContactUsPageMockData = ContactUsPageContent & {
    contactsTitle: string;
    socialLinksTitle: string;
    copyEmailAria: string;
    copyPhoneAria: string;
    formLabel: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
    submitButton: string;
    contactFormHeader1?: string;
    contactFormHeader2?: string;
};

export const CONTACT_US_PAGE_DATA: ContactUsPageMockData = {
    title: 'Ми завжди відкриті для вас',
    description: 'Якщо у вас є запитання, пропозиції чи ви шукаєте підтримку - наша команда завжди готова допомогти.',
    contactsTitle: 'Наші контакти:',
    socialLinksTitle: 'Соцмережі:',
    contacts: {
        email: 'victorycenter@gmail.com',
        phone: '+380 50 334 4448',
        address: 'вул. Шулявська, буд. 20/22, кв. 41.',
        motto: 'Україна, 04116. (юридична адреса)',
    },
    socialLinks: [
        { label: 'Facebook', url: 'https://www.facebook.com/victorycenterua' },
        { label: 'Telegram', url: 'https://t.me/victorycenterua' },
        { label: 'Instagram', url: 'https://www.instagram.com/victorycenterua' },
    ],
    copyEmailAria: 'Скопіювати email',
    copyPhoneAria: 'Скопіювати номер телефону',
    formLabel: "Форма зворотного зв'язку",
    namePlaceholder: "Ваше ім'я",
    emailPlaceholder: 'E-mail',
    subjectPlaceholder: 'Тема звернення',
    messagePlaceholder: 'Напишіть ваше повідомлення',
    submitButton: 'Надіслати',
    contactFormHeader1: 'МИ ЗАВЖДИ',
    contactFormHeader2: 'ВІДКРИТІ ДЛЯ ВАС',
};
