import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { EventCategory } from '@/types/admin/event-category';
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
            const categories: EventCategory[] = [
                { id: 1, name: 'Category 1' },
                { id: 2, name: 'Category 2' },
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
            const category: EventCategory = {
                id: 1,
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
            const category: EventCategory = {
                id: 1,
                name: 'Category 1',
            };

            const client = {
                post: jest.fn().mockResolvedValue({
                    data: category,
                }),
            } as unknown as AxiosInstance;

            const result = await EventCategoriesApi.create(client, category);

            expect(result).toEqual(category);
        });
    });

    describe('update', () => {
        it('calls event category endpoint with category data', async () => {
            const category: EventCategory = {
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
            const category: EventCategory = {
                id: 1,
                name: 'Updated Category',
            };

            const client = {
                put: jest.fn().mockResolvedValue({
                    data: category,
                }),
            } as unknown as AxiosInstance;

            const result = await EventCategoriesApi.update(client, category);

            expect(result).toEqual(category);
        });

        it('throws an error when category id is missing', async () => {
            const category = {
                name: 'Category 1',
            } as EventCategory;

            const client = {
                put: jest.fn(),
            } as unknown as AxiosInstance;

            await expect(EventCategoriesApi.update(client, category)).rejects.toThrow(
                'EventCategoriesApi.update: category id is required.',
            );

            expect(client.put).not.toHaveBeenCalled();
        });
    });
});
