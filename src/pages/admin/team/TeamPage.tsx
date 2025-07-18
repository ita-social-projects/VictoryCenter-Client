import './team-page.scss';
import React from 'react';
import { TeamPageContent } from './components/team-page-content/TeamPageContent';
import { TeamCategory } from '../../../types/public/TeamPage';
import { categoryMap } from '../../../const/admin/team-page';

export const reverseCategoryMap: Record<number, TeamCategory> = Object.entries(categoryMap).reduce(
    (acc, [key, value]) => {
        acc[value] = key as TeamCategory;
        return acc;
    },
    {} as Record<number, TeamCategory>,
);

export const TeamPageAdmin = () => {
    return <TeamPageContent></TeamPageContent>;
};
