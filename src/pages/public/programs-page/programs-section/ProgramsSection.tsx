import React, { useMemo, useState } from 'react';
import { programPageDataFetch } from '@/services/api/public/programs/programs-api';
import { ProgramCategoryDto, ProgramsPageData } from '@/types/public/programs-page';
import classNames from 'classnames';
import { LinearProgress } from '@mui/material';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useTranslation } from 'react-i18next';
import styles from './ProgramsSection.module.scss';
import { ProgramCard } from '@/components/public/program-card/ProgramCard';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { DEFAULT_ENGLISH_LANGUAGE_ID } from '@/const/common/locales';

const localizeCategory = (category: ProgramCategoryDto, language: string): ProgramCategoryDto => {
    const localization = (category.localizations ?? []).find(
        (item) =>
            item.localizationInfoDto?.code === language ||
            (language === 'en' && item.languageId === DEFAULT_ENGLISH_LANGUAGE_ID),
    );

    return localization?.name ? { ...category, name: localization.name } : category;
};

export const ProgramsSection: React.FC = () => {
    const { t } = useTranslation(['programsPage', 'footer']);
    const { currentLanguage } = useLocale();

    const [programCategory, setProgramCategory] = useState<ProgramCategoryDto | null>(null);
    const { data, isLoading, error } = useDataFetch<ProgramsPageData | null>({
        initialData: null,
        fetchHandler: programPageDataFetch,
        autoFetchDependencies: [currentLanguage, programCategory],
    });
    const programsByCategory = useMemo<ProgramsPageData['programsData'] | undefined>(() => {
        if (!data) return undefined;

        const categoryById = new Map(data.programsCategories.map((category) => [category.id, category]));
        const filteredPrograms = programCategory
            ? data.programsData.filter((program) =>
                  program.categories.some((category) => category.id === programCategory.id),
              )
            : data.programsData;

        return filteredPrograms.map((program) => ({
            ...program,
            categories: program.categories.map((category) =>
                localizeCategory(categoryById.get(category.id) ?? category, currentLanguage),
            ),
        }));
    }, [currentLanguage, data, programCategory]);

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
                            onClick={() => handleProgramCategoryChange(localizeCategory(pc, currentLanguage))}
                            key={pc.id}
                            className={classNames({
                                [styles['white-button']]: programCategory?.id !== pc.id,
                                [styles['black-button']]: programCategory?.id === pc.id,
                            })}
                        >
                            {localizeCategory(pc, currentLanguage).name}
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
                    programsByCategory?.map((item) => <ProgramCard key={item.id} program={item} variant="program" />)
                )}
            </div>
        </div>
    );
};
