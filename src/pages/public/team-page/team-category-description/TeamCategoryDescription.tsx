import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { TeamItem } from '@/types/public/team-page';

type TeamCategoryDescriptionProps = {
    team: TeamItem;
};

export function TeamCategoryDescription({ team }: TeamCategoryDescriptionProps) {
    const { name, description } = useGetLocalization(team.localizations, {
        name: team.title,
        description: team.description,
    });

    return (
        <div className="team_category_description">
            <h2>{name}</h2>
            <p>{description}</p>
        </div>
    );
}
