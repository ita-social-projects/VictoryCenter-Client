import React, { useState, useEffect } from 'react';
import styles from './TeamPage.module.scss';
import horseVideo from '../../../assets/videos/public/team-page/quote_background.mp4';
import classNames from 'classnames';
import {
    DOWNLOAD_ERROR,
    VIDEO_TEXT_AUTHOR,
    VIDEO_TEXT_STRING1,
    VIDEO_TEXT_STRING2,
    VIDEO_TEXT_STRING3,
    VIDEO_TEXT_STRING4,
    VIDEO_TEXT_STRING5,
} from '../../../const/public/team-page';
import { teamPageDataFetch } from '../../../services/api/public/team/team-api';
import { TeamItem } from '../../../types/public/team-page';
import { TeamMemberCard } from './team-member-card/TeamMemberCard';
import { LinearProgress } from '@mui/material';

export const TeamPage: React.FC = () => {
    const [teamData, setTeamData] = useState<TeamItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await teamPageDataFetch();
                const { teamData } = response;
                setTeamData(teamData);
                setError(null);
            } catch {
                setError(DOWNLOAD_ERROR);
                setTeamData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className={styles['team-page-container']}>
            {error && (
                <div className={styles['error-message']} role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className={styles['team-loader']}>
                    <LinearProgress />
                </div>
            ) : (
                teamData.map((team, index) => (
                    <div
                        key={index}
                        className={classNames(styles['team-section'], {
                            [styles['last-section']]: index === teamData.length - 1,
                        })}
                    >
                        <div className={styles['team_info']}>
                            <div className={styles['members-grid']}>
                                <div className={styles['team_description']}>
                                    <h2>{team.title}</h2>
                                    <p>{team.description}</p>
                                </div>
                                {team.members.map((member) => (
                                    <TeamMemberCard key={member.id} member={member} stylesModule={styles} />
                                ))}
                            </div>
                        </div>
                    </div>
                ))
            )}

            <div className={styles['video-background-container']}>
                <video autoPlay muted loop playsInline className={styles['background-video']}>
                    <source src={horseVideo} type="video/mp4" />
                </video>

                <div className={styles['quote-overlay']}>
                    <p className={styles['video-text']}>{VIDEO_TEXT_STRING1}</p>
                    <p className={styles['video-text']}>{VIDEO_TEXT_STRING2}</p>
                    <p className={styles['video-text']}>{VIDEO_TEXT_STRING3}</p>
                    <p className={styles['video-text']}>{VIDEO_TEXT_STRING4}</p>
                    <p className={styles['video-text']}>{VIDEO_TEXT_STRING5}</p>

                    <p className={styles['author']}>{VIDEO_TEXT_AUTHOR}</p>
                </div>
            </div>
        </div>
    );
};
