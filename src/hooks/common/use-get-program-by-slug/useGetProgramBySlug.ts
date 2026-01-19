import { fetchProgramBySlug } from '@/services/api/public/programs/programs-api';
import { DetailedProgram } from '@/types/public/programs-page';
import { useEffect, useState } from 'react';

export const useProgramBySlug = (slug?: string) => {
    const [program, setProgram] = useState<DetailedProgram | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!slug) {
            setProgram(null);
            setError(null);
            setIsLoading(false);
            return;
        }
        let isMounted = true;

        const fetchProgram = async () => {
            try {
                setIsLoading(true);
                const data = await fetchProgramBySlug(slug);
                if (isMounted) {
                    setProgram(data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err as Error);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchProgram();

        return () => {
            isMounted = false;
        };
    }, [slug]);

    return { program, isLoading, error };
};
