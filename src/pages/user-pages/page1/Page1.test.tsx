import { render, screen } from '@testing-library/react';
import { Page1 } from './Page1';
import * as Page1DataFetchModule from '../../../services/data-fetch/user-pages-data-fetch/page-1-data-fetch/page1DataFetch';

const spyPage1DataFetch = jest.spyOn(Page1DataFetchModule, 'page1DataFetch');

const mockTeamData = [
  {
    title: 'Основна команда',
    description: 'Люди, які щодня координують роботу програм, супроводжують учасників, будують логістику, фасилітують сесії.',
    members: [
      {
        name: 'Настя Попандопулус',
        role: 'виконавча директорка',
        photo: 'https://via.placeholder.com/200x250?text=Настя',
      },
      {
        name: 'Наталія Пазюк',
        role: 'менторка-психологиня',
        photo: 'https://via.placeholder.com/200x250?text=Наталія',
      },
    ],
  },
];

describe('Page1', () => {
  beforeEach(() => {
    spyPage1DataFetch.mockResolvedValue({
      teamData: mockTeamData,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders header, content and team members', async () => {
    render(<Page1 />);

    expect(spyPage1DataFetch).toHaveBeenCalledTimes(1);

    mockTeamData.forEach(team => {
      expect(screen.getByText(team.title)).toBeInTheDocument();
      expect(screen.getByText(team.description)).toBeInTheDocument();
      team.members.forEach(member => {
        expect(screen.getByText(member.name)).toBeInTheDocument();
        expect(screen.getByText(member.role)).toBeInTheDocument();
        const img = screen.getByAltText(member.name) as HTMLImageElement;
        expect(img).toBeInTheDocument();
        expect(img.src).toBe(member.photo);
      });
    });
  });
});
