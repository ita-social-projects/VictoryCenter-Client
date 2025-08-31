import React, { useEffect, useMemo, useState } from 'react';
import './ProgramsSection.scss';
import { PROGRAMS } from '../../../../const/public/footer';
import { FAILED_TO_LOAD_THE_PROGRAMS } from '../../../../const/public/programs-page';
import { programPageDataFetch } from '../../../../services/api/public/programs/programs-api';
import { ProgramCard } from './program-card/ProgramCard';
import { ProgramCategoryDto, ProgramsPageData } from '../../../../types/public/programs-page';
import classNames from 'classnames';
import { LinearProgress } from '@mui/material';

export const ProgramsSection = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [programData, setProgramData] = useState<ProgramsPageData | null>();
    const [error, setError] = useState<string | null>(null);
    const [programCategory, setProgramCategory] = useState<ProgramCategoryDto | null>(null);
    const programsByCategory = useMemo(
        () =>
            programCategory && programData
                ? programData.programsData.filter(
                      (x) => x.categories.filter((pc) => pc.id === programCategory.id).length > 0,
                  )
                : programData?.programsData,
        [programCategory, programData],
    );

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const response = await programPageDataFetch();
                setProgramData(response);
                setError(null);
            } catch {
                setError(FAILED_TO_LOAD_THE_PROGRAMS);
                setProgramData(null);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const handleProgramCategoryChange = (programCategory: ProgramCategoryDto | null) => {
        setProgramCategory(programCategory);
    };

    return (
        <div className="program-block">
            <div className="menu-block">
                <h2>{PROGRAMS}</h2>
                <div className="button-block">
                    {programData?.programsCategories.map((pc) => (
                        <button
                            onClick={() => handleProgramCategoryChange(pc)}
                            key={pc.id}
                            className={classNames({
                                'white-button': programCategory?.id !== pc.id,
                                'black-button': programCategory?.id === pc.id,
                            })}
                        >
                            {pc.name}
                        </button>
                    ))}
                    <button
                        onClick={() => handleProgramCategoryChange(null)}
                        className={classNames({
                            'white-button': programCategory !== null,
                            'black-button': programCategory === null,
                        })}
                    >
                        Усі
                    </button>
                </div>
            </div>
            <div className="cards-block">
                {error && (
                    <div className="error-message" role="alert" style={{ color: 'red' }}>
                        {error}
                    </div>
                )}
                {isLoading ? (
                    <div>
                        <LinearProgress></LinearProgress>
                    </div>
                ) : (
                    programsByCategory?.map((item, index) => <ProgramCard key={index} program={item} />)
                )}
            </div>
        </div>
    );
};
