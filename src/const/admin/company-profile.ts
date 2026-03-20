export const COMPANY_PROFILE_TEXT = {
    TABS: {
        PROFILE: 'Профіль компанії',
        REQUISITES: 'Реквізити компанії',
        SOCIALS: 'Соціальні мережі',
    },

    HEADER: {
        TITLE: 'Victory Center',
        SUBTITLE: 'Адмінна панель компанії',
    },

    MODAL: {
        CANCEL_TITLE: 'Скасувати редагування?',
    },

    PROFILE_TAB: {
        SECTION_TITLE: 'Контакти',
        PHONE_LABEL: 'Телефон',
        PROFILE_ADDRESS_UA_LABEL: 'Адреса/UA',
        PROFILE_ADDRESS_EN_LABEL: 'Адреса/ENG',
        EMAIL_LABEL: 'Пошта',
        CORRESPONDENCE_EMAIL_LABEL: 'Пошта для отримання кореспонденції',
        MOTTO_UA_LABEL: 'Девіз/UA',
        MOTTO_EN_LABEL: 'Девіз/ENG',
        TOOLTIP_ADDRESS_UA: 'Адреса компанії на UA. Відображається на сторінці “Зв’язатися“',
        TOOLTIP_ADDRESS_EN: 'Переклад адреси компанії на ENG. Відображається на сторінці “Зв’язатися”',
    },

    TOOLBAR: {
        EDIT_PAGE: 'Редагувати сторінку',
        CANCEL: 'Відмінити',
        PUBLISH: 'Опублікувати',
    },

    REQUISITES_TAB: {
        SECTION_TITLE: 'Реквізити компанії',
        REQUISITES_UA_LABEL: 'Одержувач/UA',
        REQUISITES_EN_LABEL: 'Одержувач/ENG',
        COMPANY_REGISTRATION_NUMBER_LABEL: 'ЄДРПОУ',
        REQUISITES_ADDRESS_UA_LABEL: 'Адреса/UA',
        REQUISITES_ADDRESS_EN_LABEL: 'Адреса/ENG',
        TOOLTIP_REQUISITES_UA: 'Адреса компанії на UA. Використовується при додаванні нових реквізитів для донатів',
        TOOLTIP_REQUISITES_EN:
            'Переклад адреси компанії на ENG. Використовується при додаванні нових реквізитів для донатів. Якщо переклад не потрібен — введіть українською.',
        TOOLTIP_COMPANY_REGISTRATION_NUMBER: 'Використовується при додаванні нових реквізитів для донатів у UAH.',
        TOOLTIP_REQUISITES_ADDRESS_UA:
            'Використовується при додаванні нових реквізитів для донатів, коли необхідно ввести одержувача українською мовою.',
        TOOLTIP_REQUISITES_ADDRESS_EN:
            'Використовується при додаванні нових реквізитів для донатів, коли необхідно ввести одержувача англійською мовою. Якщо переклад не потрібен — введіть українською.',
    },

    SOCIAL_MEDIA_TAB: {
        SECTION_TITLE: 'Соціальні мережі',
        PLATFORMS: {
            FACEBOOK: 'Facebook',
            INSTAGRAM: 'Instagram',
            TELEGRAM: 'Telegram',
            YOUTUBE: 'YouTube',
            X: 'Twitter/X',
            WHATSAPP: 'WhatsApp',
            LINKEDIN: 'LinkedIn',
            VIBER: 'Viber',
        },
        ADD_CONTACT_PLACEHOLDER: 'Додати контакт',
        LIMIT_MESSAGE: 'Дозволено лише 4 контакти.',
    },
} as const;
