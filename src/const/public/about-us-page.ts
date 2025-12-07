import menAndHorse from '@assets/images/public/about-us-page/man-horse.jpg';
import girlAndHorse from '@assets/images/public/about-us-page/girl-horse.jpg';
import oldMenAndHorse from '@assets/images/public/about-us-page/old-man-horse.jpg';
import womenAndHorse from '@assets/images/public/about-us-page/woman-horse.jpg';
import supportVeterans from '@assets/images/public/about-us-page/support-veterans.jpg';
import supportVolunteers from '@assets/images/public/about-us-page/support-volunteers.jpg';
import supportChildren from '@assets/images/public/about-us-page/support-children.jpg';

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
