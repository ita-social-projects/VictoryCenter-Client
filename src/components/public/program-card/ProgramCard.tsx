import { PublishedProgramDto } from '@/types/public/programs-page';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-up-right.svg';
import styleswhoWeAre from './ProgramCardAboutUsPage.module.scss';
import stylesPrograms from './ProgramCardProgramsPage.module.scss';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { useNavigate } from 'react-router-dom';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import cn from 'classnames';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';

interface ProgramCardProps {
    program: PublishedProgramDto;
    variant: 'program' | 'whoWeAre';
}

export const ProgramCard = ({ program, variant }: ProgramCardProps) => {
    const navigate = useNavigate();
    const programCategories = program.categories.map((categorie) => categorie.name).join(', ');
    const normalizedLocalizations = program.localizations.map((localization) =>
        mapLocalizationDtoToModel(localization),
    );

    const { name, description } = useGetLocalization(normalizedLocalizations, {
        name: program.name,
        description: program.description,
    });

    const handleClick = () => {
        if (program.slug) {
            navigate(PUBLIC_ROUTES.PROGRAM_DETAIL.getPath(program.slug));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    const styles = variant === 'whoWeAre' ? styleswhoWeAre : stylesPrograms;

    return (
        <div
            className={cn(styles.root, { clickable: !!program.slug })}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={program.slug ? 0 : -1}
            style={{ cursor: program.slug ? 'pointer' : 'default' }}
        >
            <div className={styles['image-wrapper']}>
                <img src={getImageSrc(program.previewImage)} alt={program.name} className={styles.image} />
            </div>
            <div className={styles.content}>
                <div className={styles[`subtitle-content`]}>
                    <div className={styles.subtitle}>
                        <div className={styles.link}>
                            <p className={styles.categories}>{programCategories}</p>
                            <h2 className={styles.name}>{name}</h2>
                        </div>
                        <div className={styles.arrow}>
                            <ArrowIcon className={styles.icon} />
                        </div>
                    </div>
                </div>
                <p className={styles.description}>{description}</p>
            </div>
        </div>
    );
};
