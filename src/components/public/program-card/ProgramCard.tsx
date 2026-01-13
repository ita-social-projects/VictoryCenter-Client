import { PublishedProgramDto } from '@/types/public/programs-page';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-up-right.svg';
import { useNavigate } from 'react-router-dom';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import './ProgramCardProgramsPage.scss';
import './ProgramCardAboutUsPage.scss';

interface ProgramCardProps {
    program: PublishedProgramDto;
    className: string;
}
export const ProgramCard = ({ program, className }: ProgramCardProps) => {
    const navigate = useNavigate();
    const programCategories = program.categories.map((categorie) => categorie.name).join(', ');

    const handleClick = () => {
        if (program.slug) {
            navigate(PUBLIC_ROUTES.PROGRAM_DETAIL.getPath(program.slug));
        }
    };

    return (
        <div
            className={`card-block ${className} ${program.slug ? 'clickable' : ''}`}
            onClick={handleClick}
            style={{ cursor: program.slug ? 'pointer' : 'default' }}
        >
            <img src={program.previewImage?.url} alt={program.name} className="card-img" />
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
