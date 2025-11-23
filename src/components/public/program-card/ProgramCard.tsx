import { PublishedProgramDto } from '../../../types/public/programs-page';
import { ReactComponent as ArrowIcon } from '../../../assets/icons/arrow-up-right.svg';
import aboutUsStyles from './ProgramCardAboutUsPage.module.scss';
import programsPageStyles from './ProgramCardProgramsPage.module.scss';

interface ProgramCardProps {
    program: PublishedProgramDto;
    className: 'about-us-page-card' | 'program-page-card';
}

export const ProgramCard = ({ program, className }: ProgramCardProps) => {
    const programCategories = program.categories.map((categorie) => categorie.name).join(', ');

    const isAboutUsPage = className === 'about-us-page-card';
    const styles = isAboutUsPage ? aboutUsStyles : programsPageStyles;
    const blockClass = isAboutUsPage ? styles['card-block--about-us-page'] : styles['card-block--program-page'];

    return (
        <div className={blockClass}>
            <img src={program.image?.url} alt={program.name} className={styles['card-block__image']} />
            <div className={styles['card-block__content']}>
                <div className={styles['card-block__subtitle-info']}>
                    <div className={styles['card-block__subtitle-content']}>
                        <div className={styles['card-block__subtitle-link']}>
                            <p className={styles['card-block__program-subtitle']}>{programCategories}</p>
                            <h2 className={styles['card-block__program-title']}>{program.name}</h2>
                        </div>
                        <div className={styles['card-block__arrow-container']}>
                            <ArrowIcon className={styles['card-block__arrow-icon']} />
                        </div>
                    </div>
                </div>
                <div className={styles['card-block__subtitle-info-hover']}>
                    <p className={styles['card-block__program-description']}>{program.description}</p>
                </div>
            </div>
        </div>
    );
};
