import React from 'react';
import { PublishedProgram } from '../../../../../types/public/programs-page';
import { ReactComponent as ArrowIcon } from '../../../../../assets/icons/arrow-up-right.svg';
import './ProgramCard.scss';

interface ProgramCardProps {
    program: PublishedProgram;
}
export const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
    return (
        <div className="card-block">
            <img src={program.image} alt={program.title} className="card-img" />
            <div className="card-content">
                <div className="subtitle-info">
                    <div className="subtitle-content">
                        <div className="subtitle-link">
                            <p className="program-subtitle">{program.subtitle}</p>
                            <h2 className="program-title">{program.title}</h2>
                        </div>
                        <div className="arrow-container">
                            <ArrowIcon className="arrow-icon" aria-hidden={true} />
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
