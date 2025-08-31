import React from 'react';
import { PublishedProgramDto } from '../../../../../types/public/programs-page';
import arrowBlack from '../../../../../assets/icons/arrow-up-right.svg';
import arrowYellow from '../../../../../assets/icons/arrow-up-right-yellow.svg';
import './ProgramCard.scss';
import { mapImageToBase64 } from '../../../../../utils/functions/map-image-to-base-64/map-image-to-base-64';

interface ProgramCardProps {
    program: PublishedProgramDto;
}
export const ProgramCard = ({ program }: ProgramCardProps) => {
    return (
        <div className="card-block">
            <img src={mapImageToBase64(program.image)!} alt={program.name} className="card-img" />
            <div className="card-content">
                <div className="subtitle-info">
                    <div className="subtitle-content">
                        <div className="subtitle-link">
                            <p className="program-subtitle">{program.name}</p>
                            <h2 className="program-title">{program.categories.map((x) => x.name).join(', ')}</h2>
                        </div>
                        <div className="arrow-container">
                            <img src={arrowYellow} alt="" className="hover-img" />
                            <img src={arrowBlack} alt="" className="default-img" />
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
