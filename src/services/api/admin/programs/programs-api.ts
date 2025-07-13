import {
    Program,
    ProgramCategory,
    ProgramCategoryCreateUpdate,
    ProgramCreateUpdate,
    ProgramStatus
} from "../../../../types/ProgramAdminPage";
import { mockCategories, mockPrograms } from "../../../../utils/mock-data/admin-page/programPage";
import { PaginationResult } from "../../../../types/Common";

// Delete after actual integration with backend
let mockProgramId = Math.max(...mockPrograms.map(p => p.id), 0) + 1;
let mockCategoryId = Math.max(...mockCategories.map(c => c.id), 0) + 1;

// Change this when integrating the client with the backend
const ProgramsApi = {
    fetchProgramCategories: async (): Promise<ProgramCategory[]> => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return [...mockCategories];
    },

    fetchProgramById: async (id: number): Promise<Program | null> => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return mockPrograms.find((program) => program.id === id) ?? null;
    },

    fetchPrograms: async (
        categoryId: number,
        pageNumber: number,
        pageSize: number,
        status?: ProgramStatus
    ): Promise<PaginationResult<Program>> => {
        await new Promise((resolve) => setTimeout(resolve, 200));

        const filtered = mockPrograms.filter((program) => {
            const inCategory = program.categories.some((category) => category.id === categoryId);
            const statusMatches = !status || program.status === status;
            return inCategory && statusMatches;
        });

        console.log(`Status: ${status}`);

        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;

        return {
            items: filtered.slice(start, end),
            totalItemsCount: filtered.length,
        };
    },

    addProgram: async (program: ProgramCreateUpdate): Promise<Program> => {
        await new Promise((resolve) => setTimeout(resolve, 200));

        const newProgram: Program = {
            id: ++mockProgramId,
            name: program.name,
            description: program.description,
            status: program.status,
            img: program.img,
            categories: mockCategories.filter(c => program.categoryIds.includes(c.id)),
        };

        mockPrograms.push(newProgram);
        return newProgram;
    },

    editProgram: async (program: ProgramCreateUpdate): Promise<Program> => {
        await new Promise((resolve) => setTimeout(resolve, 200));

        const index = mockPrograms.findIndex(p => p.id === program.id);
        if (index === -1) throw new Error('Program not found');

        const updatedProgram: Program = {
            id: program.id!,
            name: program.name,
            description: program.description,
            status: program.status,
            img: program.img,
            categories: mockCategories.filter(c => program.categoryIds.includes(c.id)),
        };

        mockPrograms[index] = updatedProgram;
        return updatedProgram;
    },

    deleteProgram: async (id: number): Promise<void> => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const index = mockPrograms.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Program not found');
        mockPrograms.splice(index, 1);
    },

    addProgramCategory: async (category: ProgramCategoryCreateUpdate): Promise<ProgramCategory> => {
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const newCategory: ProgramCategory = {
            id: ++mockCategoryId,
            name: category.name,
            programsCount: 0,
        };

        mockCategories.push(newCategory);
        return newCategory;
    },

    editCategory: async (category: ProgramCategoryCreateUpdate): Promise<ProgramCategory> => {
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const index = mockCategories.findIndex(c => c.id === category.id);
        if (index === -1) throw new Error('Category not found');

        const updated = {
            ...mockCategories[index],
            name: category.name
        };

        mockCategories[index] = updated;

        return updated;
    },

    deleteCategory: async (id: number): Promise<void> => {
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const index = mockCategories.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Category not found');

        const category = mockCategories[index];

        if (category.programsCount > 0){
            throw new Error('Category has at least one program');
        }

        mockCategories.splice(index, 1);
    },
};

export default ProgramsApi;
