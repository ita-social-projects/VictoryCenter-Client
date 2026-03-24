import menAndHorse from '@/assets/images/man-horse.webp';
import girlAndHorse from '@/assets/images/girl-horse.webp';
import oldMenAndHorse from '@/assets/images/old-man-horse.webp';
import womenAndHorse from '@/assets/images/woman-horse.webp';
import supportVeterans from '@/assets/images/support-veterans.webp';
import supportVolunteers from '@/assets/images/support-volunteers.webp';
import supportChildren from '@/assets/images/support-children.webp';

export const ABOUT_US_DATA = {
    INTRO_TITLE: {
        FIRST_HIGHLIGHT: 'Простір',
        MIDDLE_PART: ' довіри, турботи та твоєї ',
        SECOND_HIGHLIGHT: 'внутрішньої сили',
    },
    PEOPLE_DATA: [
        {
            IMG: menAndHorse,
            CARD_CLASS: 'aside-card',
        },
        {
            IMG: girlAndHorse,
            CARD_CLASS: 'middle-card',
        },
        {
            IMG: oldMenAndHorse,
            CARD_CLASS: 'middle-card',
        },
        {
            IMG: womenAndHorse,
            CARD_CLASS: 'aside-card',
        },
    ],
    SUPPORT_DATA: [
        {
            IMG: supportVeterans,
        },
        {
            IMG: supportVolunteers,
        },
        {
            IMG: supportChildren,
        },
    ],
};
