import React, { useState, useEffect } from 'react';
import './page1.scss';

import { page1DataFetch } from '../../../services/data-fetch/user-pages-data-fetch/page-1-data-fetch/page1DataFetch';
import { TeamMember } from './TeamMemberCard/TeamMemberCard';

interface Member {
  name: string;
  role: string;
  photo: string;
}

interface TeamItem {
  title: string;
  description: string;
  members: Member[];
}

export const Page1: React.FC = () => {
  const [teamData, setTeamData] = useState<TeamItem[]>([]);

  useEffect(() => {
    (async () => {
      const response = await page1DataFetch();
      const {teamData } = response;
      setTeamData(teamData);
    })();
  }, []);

  return (
    <div className="page1-container">
      {teamData.map((team, index) => (
        <div key={index} className="team-section">
          <h2>{team.title}</h2>
          <p>{team.description}</p>
          <ul className="team-members-list">
            {team.members.map((member) => (
              <TeamMember key={member.name} member={member} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};