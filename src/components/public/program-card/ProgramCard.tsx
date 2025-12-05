import { PublishedProgramDto } from '../../../types/public/programs-page';
import { ReactComponent as ArrowIcon } from '../../../assets/icons/arrow-up-right.svg';
import './ProgramCardProgramsPage.scss';
import './ProgramCardAboutUsPage.scss';

interface ProgramCardProps {
    program: PublishedProgramDto;
    className: string;
}
export const ProgramCard = ({ program, className }: ProgramCardProps) => {
    const programCategories = program.categories.map((categorie) => categorie.name).join(', ');
    return (
        <div className={`card-block ${className}`}>
            <img src={program.image?.url} alt={program.name} className="card-img" />
            <div className="card-content">
                <div className="subtitle-info">
                    <div className="subtitle-content">
                        <div className="subtitle-link">
                            <p className="program-subtitle">{programCategories}</p>
                            <h2 className="program-title">{program.name}</h2>
                        </div>
                        <div className="arrow-container">
                            <ArrowIcon className="arrow-icon" />
                        </div>
                    </div>
                </div>
                <div className="subtitle-info-hover">
                    <p className="program-description">{program.description}</p>
                </div>
            </div>
        </div>
    );
};
