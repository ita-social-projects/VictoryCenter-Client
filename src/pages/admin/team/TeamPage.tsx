import './team-page.scss';
import React from 'react';
import { TeamPageContent } from './components/team-page-content/TeamPageContent';

export type TeamCategory = 'Основна команда' | 'Наглядова рада' | 'Радники';

export const categoryMap: Record<TeamCategory, number> = {
  "Основна команда": 1,
  "Наглядова рада": 2,
  "Радники": 3
};

export const reverseCategoryMap: Record<number, TeamCategory> = Object.entries(categoryMap)
  .reduce((acc, [key, value]) => {
    acc[value] = key as TeamCategory;
    return acc;
  }, {} as Record<number, TeamCategory>);

export const TeamPageAdmin = () => {
    return <TeamPageContent></TeamPageContent>;
};
