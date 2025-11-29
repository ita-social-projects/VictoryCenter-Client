import React, { useMemo, useState } from 'react';
import { programPageDataFetch } from '../../../../services/api/public/programs/programs-api';
import { ProgramCategoryDto, ProgramsPageData } from '../../../../types/public/programs-page';
import classNames from 'classnames';
import { LinearProgress } from '@mui/material';
import { useDataFetch } from '../../../../hooks/common/use-data-fetch/useDataFetch';
import { useTranslation } from 'react-i18next';
import styles from './ProgramsSection.module.scss';
import { ProgramCard } from '../../../../components/public/program-card/ProgramCard';

export const ProgramsSection: React.FC = () => {
    const { t } = useTranslation(['programsPage', 'footer']);

    const [programCategory, setProgramCategory] = useState<ProgramCategoryDto | null>(null);
    const { data, isLoading, error } = useDataFetch<ProgramsPageData | null>({
        initialData: null,
        fetchHandler: programPageDataFetch,
        autoFetchDependencies: [programCategory],
    });
    const programsByCategory = useMemo<ProgramsPageData['programsData'] | undefined>(
        () =>
            programCategory && data
                ? data.programsData.filter((x) => x.categories.filter((pc) => pc.id === programCategory.id).length > 0)
                : data?.programsData,
        [programCategory, data],
    );

    const handleProgramCategoryChange = (programCategory: ProgramCategoryDto | null) => {
        setProgramCategory(programCategory);
    };

    return (
        <div className={styles['program-block']}>
            <div className={styles['menu-block']}>
                <h2>{t('PROGRAMS')}</h2>
                <div className={styles['button-block']}>
                    {data?.programsCategories.map((pc) => (
                        <button
                            onClick={() => handleProgramCategoryChange(pc)}
                            key={pc.id}
                            className={classNames({
                                [styles['white-button']]: programCategory?.id !== pc.id,
                                [styles['black-button']]: programCategory?.id === pc.id,
                            })}
                        >
                            {pc.name}
                        </button>
                    ))}
                    <button
                        onClick={() => handleProgramCategoryChange(null)}
                        className={classNames({
                            [styles['white-button']]: programCategory !== null,
                            [styles['black-button']]: programCategory === null,
                        })}
                    >
                        {t('PROGRAMS_ALL')}
                    </button>
                </div>
            </div>
            <div className={styles['cards-block']}>
                {error && (
                    <div className={styles['error-message']} role="alert" style={{ color: 'red' }}>
                        {t('FAILED_TO_LOAD_THE_PROGRAMS')}
                    </div>
                )}
                {isLoading ? (
                    <LinearProgress />
                ) : (
                    programsByCategory?.map((item) => (
                        <ProgramCard key={item.id} program={item} className={'program-page-card'} />
                    ))
                )}
            </div>
        </div>
    );
};
