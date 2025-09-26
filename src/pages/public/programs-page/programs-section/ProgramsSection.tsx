import React, { useState, useEffect } from 'react';
import { programPageDataFetch } from '../../../../services/api/public/programs/programs-api';
import { ProgramCard } from './program-card/ProgramCard';
import { PublishedProgram } from '../../../../types/public/programs-page';
import { useTranslation } from 'react-i18next';
import './ProgramsSection.scss';

export const ProgramsSection: React.FC = () => {
    const { t } = useTranslation(['programsPage', 'footer']);

    const [programData, setProgramData] = useState<PublishedProgram[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await programPageDataFetch();
                setProgramData(response.programData);
                setError(null);
            } catch {
                setError(t('FAILED_TO_LOAD_THE_PROGRAMS'));
                setProgramData([]);
            }
        })();
    }, []);

    return (
        <div className="program-block">
            <div className="menu-block">
                <h2>{t('PROGRAMS')}</h2>
                <div className="button-block">
                    <button className="white-button">{t('PROGRAMS_FOR_KIDS')}</button>
                    <button className="white-button">{t('PROGRAMS_FOR_VETERANS')}</button>
                    <button className="black-button">{t('PROGRAMS_ALL')}</button>
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
