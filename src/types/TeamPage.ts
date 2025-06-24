export interface Member {
  id: number;
  name: string;
  role: string;
  photo: string;
}

export interface TeamItem {
  title: string;
  description: string;
  members: Member[];
}
export interface TeamMemberProps {
  member: Member;
}
