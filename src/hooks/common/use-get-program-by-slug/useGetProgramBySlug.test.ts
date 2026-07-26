import { renderHook, waitFor } from '@testing-library/react';
import { useProgramBySlug } from './useGetProgramBySlug';
import { DetailedProgramDto } from '@/types/public/programs-page';

const createMockProgram = (): DetailedProgramDto => ({
    id: 1,
    slug: 'test-program',
    name: 'Test Program',
    description: 'Test Description',
    location: 'Test Location',
    participantsCount: '100 participants',
    meetingsCount: '10 meetings',
    backgroundImage: null,
    previewImage: null,
    sections: [],
    localizations: [],
});

describe('useProgramBySlug', () => {
    const callback = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default state when no slug provided', () => {
        const { result } = renderHook(() => useProgramBySlug(callback));

        expect(result.current.program).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(callback).not.toHaveBeenCalled();
    });

    it('should fetch program successfully when slug is provided', async () => {
        const mockProgram = createMockProgram();
        callback.mockResolvedValue(mockProgram);

        const { result } = renderHook(() => useProgramBySlug(callback, 'test-program'));

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.program).toEqual(mockProgram);
        expect(result.current.error).toBeNull();
        expect(callback).toHaveBeenCalledWith('test-program');
    });

    it('should handle fetch error', async () => {
        const mockError = new Error('Failed to fetch program');
        callback.mockRejectedValue(mockError);

        const { result } = renderHook(() => useProgramBySlug(callback, 'test-program'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.program).toBeNull();
        expect(result.current.error).toEqual(mockError);
    });

    it('should refetch when slug changes', async () => {
        const mockProgram1 = createMockProgram();
        const mockProgram2 = { ...createMockProgram(), id: 2, slug: 'another-program', name: 'Another Program' };

        callback.mockResolvedValueOnce(mockProgram1).mockResolvedValueOnce(mockProgram2);

        const { result, rerender } = renderHook(({ slug }) => useProgramBySlug(callback, slug), {
            initialProps: { slug: 'test-program' },
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.program).toEqual(mockProgram1);

        rerender({ slug: 'another-program' });

        await waitFor(() => {
            expect(result.current.program).toEqual(mockProgram2);
        });

        expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should not update state if component unmounts during fetch', async () => {
        const mockProgram = createMockProgram();
        let resolvePromise: (value: DetailedProgramDto) => void;

        callback.mockReturnValue(
            new Promise<DetailedProgramDto>((resolve) => {
                resolvePromise = resolve;
            }),
        );

        const { result, unmount } = renderHook(() => useProgramBySlug(callback, 'test-program'));

        expect(result.current.isLoading).toBe(true);

        unmount();

        resolvePromise!(mockProgram);

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(result.current.isLoading).toBe(true);
    });
});
