import React from "react";

interface Member {
  name: string;
  role: string;
  photo: string;
}

interface TeamMemberProps {
  member: Member;
}

export const TeamMember: React.FC<TeamMemberProps> = ({ member }) => {
  return (
    <div className="team-member">
      <img src={member.photo} alt={member.name} className="member-photo" />
      <div>
        <p className="member-name">{member.name}</p>
        <p className="member-role">{member.role}</p>
      </div>
    </div>
  );
};
