import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { TeamItem } from '@/types/public/team-page';

type TeamDescriptionProps = {
    team: TeamItem;
};

export function TeamDescription({ team }: TeamDescriptionProps) {
    const { name, description } = useGetLocalization(team.localizations, {
        name: team.title,
        description: team.description,
    });

    return (
        <div className="team_description">
            <h2>{name}</h2>
            <p>{description}</p>
        </div>
    );
}
