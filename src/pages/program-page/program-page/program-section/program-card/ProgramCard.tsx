import React from 'react';
import "./ProgramCard.scss"
import arrowBlack from "../../../../../assets/program_page_images/icons/arrow-up-black.png";
import arrowYellow from "../../../../../assets/program_page_images/icons/arrow-up-yellow.png"

interface Program {
    image: string;
    title: string;
    subtitle: string;
    description: string;
}
interface ProgramCardProps{
    program: Program
}
export const ProgramCard: React.FC<ProgramCardProps> = ({program}) => {
    return (
        <div className="card-block">
            <img src={program.image} alt={program.title} className="card-img"/>
            <div className="card-content">
                <div className="subtitle-info">
                    <div className="subtitle-content">
                        <div className="subtitle-link">
                            <p className="program-subtitle">{program.subtitle}</p>
                            <h2 className="program-title">{program.title}</h2>
                        </div>
                        <div className="arrow-container">
                            <img src={arrowYellow} alt="" className="hover-img"/>
                            <img src={arrowBlack} alt="" className="default-img"/>
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
