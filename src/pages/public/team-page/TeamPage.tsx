import React, { useState, useEffect } from 'react';
import './TeamPage.scss';
import horseVideo from '../../../assets/videos/public/team-page/quote_background.mp4';
import { TeamMember } from './TeamMemberCard/TeamMemberCard';
import classNames from 'classnames';
import {
    DOWNLOAD_ERROR,
    VIDEO_TEXT_STRING1,
    VIDEO_TEXT_STRING2,
    VIDEO_TEXT_STRING3,
    VIDEO_TEXT_STRING4,
    VIDEO_TEXT_STRING5,
    VIDEO_TEXT_AUTHOR,
} from '../../../const/public/team-page';
import { TeamItem } from '../../../types/public/team-page';
import { teamPageDataFetch } from '../../../services/api/public/team/team-api';

export const TeamPage: React.FC = () => {
    const [teamData, setTeamData] = useState<TeamItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await teamPageDataFetch();
                const { teamData } = response;
                setTeamData(teamData);
                setError(null);
            } catch {
                setError(DOWNLOAD_ERROR);
                setTeamData([]);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="team-page-container">
            {error && (
                <div className="error-message" role="alert" style={{ color: 'red', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {teamData.map((team, index) => (
                <div
                    key={index}
                    className={classNames('team-section', { 'last-section': index === teamData.length - 1 })}
                >
                    <div className="team_info">
                        <div className="members-grid">
                            <div className="team_description">
                                <h2>{team.title}</h2>
                                <p>{team.description}</p>
                            </div>
                            {team.members.map((member) => (
                                <TeamMember key={member.id} member={member} />
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            <div className="video-background-container">
                <video autoPlay muted loop playsInline className="background-video">
                    <source src={horseVideo} type="video/mp4" />
                </video>

                <div className="quote-overlay">
                    <p className="video-text">{VIDEO_TEXT_STRING1}</p>
                    <p className="video-text">{VIDEO_TEXT_STRING2}</p>
                    <p className="video-text">{VIDEO_TEXT_STRING3}</p>
                    <p className="video-text">{VIDEO_TEXT_STRING4}</p>
                    <p className="video-text">{VIDEO_TEXT_STRING5}</p>
                    <p className="author">{VIDEO_TEXT_AUTHOR}</p>
                </div>
            </div>
        </div>
    );
};
