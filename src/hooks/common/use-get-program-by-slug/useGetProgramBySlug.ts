import { useEffect, useState } from 'react';

interface fetchFunction<Program> {
    (slug: string): Promise<Program>;
}

export const useProgramBySlug = <Program>(fetchFunc: fetchFunction<Program>, slug?: string) => {
    const [program, setProgram] = useState<Program | null>(null);
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
                const data = await fetchFunc(slug);
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
    }, [fetchFunc, slug]);

    return { program, isLoading, error };
};
