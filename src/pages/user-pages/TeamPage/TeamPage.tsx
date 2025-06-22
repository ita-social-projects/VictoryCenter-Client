import React, { useState, useEffect } from "react";
import "./TeamPage.scss";
import horseVideo from "../../../assets/team_page_images/horse_video.mp4";
import { teamPageDataFetch } from "../../../services/data-fetch/user-pages-data-fetch/team-page-data-fetch/TeamPageDataFetch";
import { TeamMember } from "./TeamMemberCard/TeamMemberCard";

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

export const TeamPage: React.FC = () => {
  const [teamData, setTeamData] = useState<TeamItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await teamPageDataFetch();
        const { teamData } = response;
        setTeamData(teamData);
        setError(null);
      } catch {
        setError(
          "Не вдалося завантажити дані команди. Будь ласка, спробуйте пізніше."
        );
        setTeamData([]);
      }
    })();
  }, []);

  return (
    <div className="team-page-container">
      {error && (
        <div
          className="error-message"
          role="alert"
          style={{ color: "red", marginBottom: "1rem" }}
        >
          {error}
        </div>
      )}

      {teamData.map((team, index) => (
        <div
          key={index}
          className={`team-section ${
            index === teamData.length - 1 ? "last-section" : ""
          }`}
        >
          <div className="team_info">
            <div className="team_description">
              <h2>{team.title}</h2>
              <p>{team.description}</p>
            </div>
            {team.members.map((member) => (
              <TeamMember key={member.name} member={member} />
            ))}
          </div>
        </div>
      ))}

      <div className="video-background-container">
        <video autoPlay muted loop playsInline className="background-video">
          <source src={horseVideo} type="video/mp4" />
        </video>

        <div className="quote-overlay">
          <p className="video-text">Я тут, тому що знаю з власного досвіду – коні нас рятують.</p>
          <p className="video-text">Очі учасників після програми – найкраща мотивація.</p>
          <p className="video-text">І можливість привідкрити глибину цього світу людям,</p>
          <p className="video-text">які до нього не були дотичні, а потім спостерігати цей</p>
          <p className="video-text">особливий ефект, вартує дорогого.</p>
          <p className="author">Вікторія Яковенко</p>
        </div>
      </div>
    </div>
  );
};
