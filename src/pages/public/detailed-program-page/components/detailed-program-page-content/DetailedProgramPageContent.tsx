import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import { fetchProgramBySlug } from '@/services/api/public/programs/programs-api';
import styles from './DetailedProgramPageContent.module.scss';
import { Program } from '@/types/admin/programs';

export const DetailedProgramPageContent: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    const [program, setProgram] = useState<Program | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchProgram = async () => {
            if (!slug) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const data = await fetchProgramBySlug(slug);
                setProgram(data);
                setError(null);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProgram();
    }, [slug]);

    if (isLoading) {
        return (
            <div className={styles['detailed-program-page-content']}>
                <LinearProgress />
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className={styles['detailed-program-page-content']}>
                <div className={styles['error-message']} role="alert">
                    Failed to load program details
                </div>
            </div>
        );
    }

    return (
        <div className={styles['detailed-program-page-content']}>
            <div className={styles['background-section']}>
                {program.backgroundImage && (
                    <>
                        <img
                            src={
                                'url' in program.backgroundImage
                                    ? program.backgroundImage.url
                                    : `data:${program.backgroundImage.mimeType};base64,${program.backgroundImage.base64}`
                            }
                            className={styles['background-image']}
                            alt={`${program.name} background`}
                        />
                        <div className={styles['overlay']} />
                    </>
                )}
            </div>
            <div className={styles['content-wrapper']}>
                <h1>{program.name}</h1>
                <p>{program.description}</p>
            </div>
        </div>
    );
};
