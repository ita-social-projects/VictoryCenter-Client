import {
    Program,
    ProgramCategory,
    ProgramCategoryCreateUpdate,
    ProgramCreateUpdate,
} from '../../../../types/ProgramAdminPage';
import { mockCategories, mockPrograms } from '../../../../utils/mock-data/admin-page/programPage';
import { PaginationResult, VisibilityStatus } from '../../../../types/Common';

// !!!
// Delete after actual integration with backend
// ============================================
let mockProgramId = Math.max(...mockPrograms.map((p) => p.id), 0) + 1;
let mockCategoryId = Math.max(...mockCategories.map((c) => c.id), 0) + 1;
export let mockDelay = 1200;
export let throwErrorsInApi = false;

// Simulates an async delay with AbortSignal support — used for testing fetch cancellation behavior
const simulateAsyncOperation = (delay: number, signal?: AbortSignal): Promise<void> => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            cleanup();
            resolve();
        }, delay);

        const cleanup = () => {
            clearTimeout(timeoutId);
            signal?.removeEventListener('abort', onAbort);
        };

        const onAbort = () => {
            cleanup();
            const error = new Error('Request was cancelled');
            error.name = 'AbortError';
            reject(error);
        };

        if (signal?.aborted) {
            onAbort();
        } else {
            signal?.addEventListener('abort', onAbort, { once: true });
        }
    });
};
// ============================================
// !!!
// !!!

export interface ApiOptions {
    cancellationSignal?: AbortSignal;
}

export const ProgramsApi = {
    fetchProgramCategories: async (): Promise<ProgramCategory[]> => {
        await new Promise((resolve) => setTimeout(resolve, mockDelay));
        if (throwErrorsInApi) throw new Error('Error fetching program categories');
        return [...mockCategories];
    },

    fetchProgramById: async (id: number): Promise<Program | null> => {
        await new Promise((resolve) => setTimeout(resolve, mockDelay));
        if (throwErrorsInApi) throw new Error('Error fetching program');
        return mockPrograms.find((program) => program.id === id) ?? null;
    },

    fetchPrograms: async (
        categoryId: number,
        offset: number,
        limit: number,
        status?: VisibilityStatus,
        options?: ApiOptions,
    ): Promise<PaginationResult<Program>> => {
        await simulateAsyncOperation(mockDelay, options?.cancellationSignal);
        if (throwErrorsInApi) throw new Error('Error fetching programs');

        const filtered = mockPrograms.filter((program) => {
            const inCategory = program.categories.some((category) => category.id === categoryId);
            const statusMatches = !status || program.status === status;
            return inCategory && statusMatches;
        });

        const start = offset;
        const end = offset + limit;

        return {
            items: filtered.slice(start, end),
            totalItemsCount: filtered.length,
        };
    },

    addProgram: async (program: ProgramCreateUpdate): Promise<Program> => {
        await new Promise((resolve) => setTimeout(resolve, mockDelay));

        if (throwErrorsInApi) throw new Error('Error imitation');

        let imageUrl = null;
        if (program.img instanceof File) imageUrl = URL.createObjectURL(program.img);
        else if (typeof program.img === 'string') imageUrl = program.img;

        const newProgram: Program = {
            id: ++mockProgramId,
            name: program.name,
            description: program.description,
            status: program.status,
            img: imageUrl,
            categories: mockCategories.filter((c) => program.categoryIds.includes(c.id)),
        };

        mockPrograms.push(newProgram);
        return newProgram;
    },

    editProgram: async (program: ProgramCreateUpdate): Promise<Program> => {
        await new Promise((resolve) => setTimeout(resolve, mockDelay));

        if (throwErrorsInApi) throw new Error('Error imitation');

        const index = mockPrograms.findIndex((p) => p.id === program.id);
        if (index === -1) throw new Error('Program not found');

        let imageUrl = null;
        if (program.img instanceof File) imageUrl = URL.createObjectURL(program.img);
        else if (typeof program.img === 'string') imageUrl = program.img;

        const updatedProgram: Program = {
            id: program.id!,
            name: program.name,
            description: program.description,
            status: program.status,
            img: imageUrl,
            categories: mockCategories.filter((c) => program.categoryIds.includes(c.id)),
        };

        mockPrograms[index] = updatedProgram;
        return updatedProgram;
    },

    deleteProgram: async (id: number): Promise<void> => {
        await new Promise((resolve) => setTimeout(resolve, mockDelay));

        if (throwErrorsInApi) throw new Error('Error imitation');

        const index = mockPrograms.findIndex((p) => p.id === id);
        if (index === -1) throw new Error('Program not found');
        mockPrograms.splice(index, 1);
    },

    addProgramCategory: async (category: ProgramCategoryCreateUpdate): Promise<ProgramCategory> => {
        await new Promise((resolve) => setTimeout(resolve, mockDelay));

        if (throwErrorsInApi) throw new Error('Error imitation');

        const newCategory: ProgramCategory = {
            id: ++mockCategoryId,
            name: category.name,
            programsCount: 0,
        };

        mockCategories.push(newCategory);
        return newCategory;
    },

    editCategory: async (category: ProgramCategoryCreateUpdate): Promise<ProgramCategory> => {
        await new Promise((resolve) => setTimeout(resolve, mockDelay));

        if (throwErrorsInApi) throw new Error('Error imitation');

        const index = mockCategories.findIndex((c) => c.id === category.id);
        if (index === -1) throw new Error('Category not found');

        const updated = {
            ...mockCategories[index],
            name: category.name,
        };

        mockCategories[index] = updated;

        return updated;
    },

    deleteCategory: async (id: number): Promise<void> => {
        await new Promise((resolve) => setTimeout(resolve, mockDelay));

        if (throwErrorsInApi) throw new Error('Error imitation');

        const index = mockCategories.findIndex((c) => c.id === id);
        if (index === -1) throw new Error('Category not found');

        const category = mockCategories[index];

        if (category.programsCount > 0) {
            throw new Error('Category has at least one program');
        }

        mockCategories.splice(index, 1);
    },
};

export default ProgramsApi;
