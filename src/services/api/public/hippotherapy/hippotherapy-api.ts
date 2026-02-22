import { hippotherapyMock } from '@/utils/mock-data/public/hippotherapy';
import { HippotherapyAbout } from '@/types/public/hippotherapy-page';

export const HippotherapyApi = {
    get: async (): Promise<HippotherapyAbout> => {
        // const response = await axiosInstance.get(`${API_ROUTES. .PUBLIC}`);
        return hippotherapyMock;
    },
};
