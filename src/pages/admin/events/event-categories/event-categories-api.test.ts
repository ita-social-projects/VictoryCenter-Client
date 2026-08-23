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

            expect(client.get).toHaveBeenCalledWith(
                API_ROUTES.EVENT_CATEGORIES.BASE
            );
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
});