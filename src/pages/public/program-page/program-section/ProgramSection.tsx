import React, { useState, useEffect } from 'react';
import './ProgramSection.scss';
import { ProgramCard } from './program-card/ProgramCard';
import { programPageDataFetch } from '../../../../services/api/public/programs/programs-api';
import { PROGRAMS } from '../../../../const/public/footer';
import {
    FAILED_TO_LOAD_THE_PROGRAMS,
    PROGRAMS_FOR_KIDS,
    PROGRAMS_FOR_VETERANS,
    PROGRAMS_ALL,
} from '../../../../const/public/programs-page';
import { PublishedProgram } from '../../../../types/public/program-page';

export const ProgramSection: React.FC = () => {
    const [programData, setProgramData] = useState<PublishedProgram[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await programPageDataFetch();
                setProgramData(response.programData);
                setError(null);
            } catch {
                setError(FAILED_TO_LOAD_THE_PROGRAMS);
                setProgramData([]);
            }
        })();
    }, []);

    return (
        <div className="program-block">
            <div className="menu-block">
                <h2>{PROGRAMS}</h2>
                <div className="button-block">
                    <button className="white-button">{PROGRAMS_FOR_KIDS}</button>
                    <button className="white-button">{PROGRAMS_FOR_VETERANS}</button>
                    <button className="black-button">{PROGRAMS_ALL}</button>
                </div>
            </div>
            <div className="cards-block">
                {error && (
                    <div className="error-message" role="alert" style={{ color: 'red' }}>
                        {error}
                    </div>
                )}
                {programData.map((item, index) => (
                    <ProgramCard key={index} program={item} />
                ))}
            </div>
        </div>
    );
};
