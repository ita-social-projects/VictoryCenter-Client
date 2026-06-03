import { SectionType } from '../common/stories-of-victory';

export type StoriesOfVictorySection = {
    sectionType: SectionType;
    contents: StoriesOfVictoryReview[];
};

export type StoriesOfVictoryReview = {
    id: number;
    review: string | null;
    name: string | null;
};

export type StoriesOfVictoryReviewVideo = {
    id: number;
    title: string | null;
    link: string | null;
};

export type StoriesOfVictoryReviewArticle = {
    id: number;
    title: string | null;
    text: string[] | null;
    image: string | null;
};
