import { PublishedProgramDto } from '@/types/public/programs-page';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-up-right.svg';
import styleswhoWeAre from './ProgramCardAboutUsPage.module.scss';
import stylesPrograms from './ProgramCardProgramsPage.module.scss';

interface ProgramCardProps {
    program: PublishedProgramDto;
    variant: 'program' | 'whoWeAre';
}

export const ProgramCard = ({ program, variant }: ProgramCardProps) => {
    const programCategories = program.categories.map((categorie) => categorie.name).join(', ');
    const styles = variant === 'whoWeAre' ? styleswhoWeAre : stylesPrograms;

    return (
        <div className={styles.root}>
            <img src={program.previewImage?.url} alt={program.name} className={styles.image} />
            <div className={styles.content}>
                <div className={styles[`subtitle-content`]}>
                    <div className={styles.subtitle}>
                        <div className={styles.link}>
                            <p className={styles.categories}>{programCategories}</p>
                            <h2 className={styles.name}>{program.name}</h2>
                        </div>
                        <div className={styles.arrow}>
                            <ArrowIcon className={styles.icon} />
                        </div>
                    </div>
                </div>
                <p className={styles.description}>{program.description}</p>
            </div>
        </div>
    );
};
