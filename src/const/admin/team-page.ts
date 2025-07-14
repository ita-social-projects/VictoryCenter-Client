import { TeamCategory } from '../../types/TeamPage';

export const TEAM_STATUS_DEFAULT = 'Статус';

export const categoryMap: Record<TeamCategory, number> = {
    'Основна команда': 1,
    'Наглядова рада': 2,
    'Радники': 3,
};
