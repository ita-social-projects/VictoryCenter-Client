import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { EventCategoryCreate, EventCategoryDto, EventCategoryUpdate } from '@/types/admin/event-category';
import { EventCategoriesApi } from './event-categories-api';

describe('EventCategoriesApi', () => {
    describe('getAll', () => {
        it('calls event categories endpoint', async () => {
            const client = {
                get: jest.fn().mockResolvedValue({
                    data: [],
                }),
            } as unknown as AxiosInstance;

            await EventCategoriesApi.getAll(client);

            expect(client.get).toHaveBeenCalledWith(API_ROUTES.EVENT_CATEGORIES.BASE);
        });

        it('returns event categories from response', async () => {
            const categories: EventCategoryDto[] = [
                { id: 1, name: 'Category 1', relatedEventNewsCount: 0 },
                { id: 2, name: 'Category 2', relatedEventNewsCount: 0 },
            ];

            const client = {
                get: jest.fn().mockResolvedValue({
                    data: categories,
                }),
            } as unknown as AxiosInstance;

            const result = await EventCategoriesApi.getAll(client);

            expect(result).toEqual(categories);
        });
    });

    describe('create', () => {
        it('calls event categories endpoint with category name', async () => {
            const category: EventCategoryCreate = {
                name: 'Category 1',
            };

            const client = {
                post: jest.fn().mockResolvedValue({
                    data: category,
                }),
            } as unknown as AxiosInstance;

            await EventCategoriesApi.create(client, category);

            expect(client.post).toHaveBeenCalledWith(API_ROUTES.EVENT_CATEGORIES.BASE, { name: category.name });
        });

        it('returns created event category from response', async () => {
            const category: EventCategoryCreate = {
                name: 'Category 1',
            };

            const response: EventCategoryDto = {
                id: 1,
                name: 'Category 1',
                relatedEventNewsCount: 0,
            };

            const client = {
                post: jest.fn().mockResolvedValue({
                    data: response,
                }),
            } as unknown as AxiosInstance;

            const result = await EventCategoriesApi.create(client, category);

            expect(result).toEqual(response);
        });
    });

    describe('update', () => {
        it('calls event category endpoint with category data', async () => {
            const category: EventCategoryUpdate = {
                id: 1,
                name: 'Updated Category',
            };

            const client = {
                put: jest.fn().mockResolvedValue({
                    data: category,
                }),
            } as unknown as AxiosInstance;

            await EventCategoriesApi.update(client, category);

            expect(client.put).toHaveBeenCalledWith(`${API_ROUTES.EVENT_CATEGORIES.BASE}/${category.id}`, category);
        });

        it('returns updated event category from response', async () => {
            const category: EventCategoryUpdate = {
                id: 1,
                name: 'Updated Category',
            };

            const response: EventCategoryDto = {
                id: 1,
                name: 'Updated Category',
                relatedEventNewsCount: 0,
            };

            const client = {
                put: jest.fn().mockResolvedValue({
                    data: response,
                }),
            } as unknown as AxiosInstance;

            const result = await EventCategoriesApi.update(client, category);

            expect(result).toEqual(response);
        });

        it('throws an error when category id is missing', async () => {
            const category = {
                name: 'Category 1',
            } as EventCategoryDto;

            const client = {
                put: jest.fn(),
            } as unknown as AxiosInstance;

            await expect(EventCategoriesApi.update(client, category)).rejects.toThrow(
                'EventCategoriesApi.update: category id is required.',
            );

            expect(client.put).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('calls event category endpoint with category id', async () => {
            const categoryId = 1;

            const client = {
                delete: jest.fn().mockResolvedValue({
                    data: { id: categoryId, name: 'Category 1', relatedEventNewsCount: 0 },
                }),
            } as unknown as AxiosInstance;

            await EventCategoriesApi.delete(client, categoryId);

            expect(client.delete).toHaveBeenCalledWith(`${API_ROUTES.EVENT_CATEGORIES.BASE}/${categoryId}`);
        });

        it('returns deleted event category from response', async () => {
            const category: EventCategoryDto = {
                id: 1,
                name: 'Category 1',
                relatedEventNewsCount: 0,
            };

            const client = {
                delete: jest.fn().mockResolvedValue({
                    data: category,
                }),
            } as unknown as AxiosInstance;

            const result = await EventCategoriesApi.delete(client, category.id);

            expect(result).toEqual(category);
        });

        it('throws an error when category id is missing', async () => {
            const client = {
                delete: jest.fn(),
            } as unknown as AxiosInstance;

            await expect(EventCategoriesApi.delete(client, null as unknown as number)).rejects.toThrow(
                'EventCategoriesApi.delete: category id is required.',
            );

            expect(client.delete).not.toHaveBeenCalled();
        });
    });
});
