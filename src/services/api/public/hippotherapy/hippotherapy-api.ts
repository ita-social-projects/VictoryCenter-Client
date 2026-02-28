import { hippotherapyMock } from '@/utils/mock-data/public/hippotherapy';
import { HippotherapyAbout } from '@/types/public/hippotherapy-page';

export const HippotherapyApi = {
    get: async (): Promise<HippotherapyAbout> => {
        // const response = await axiosInstance.get(`${API_ROUTES. .PUBLIC}`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const success = true;

                if (success) {
                    resolve(hippotherapyMock);
                } else {
                    reject(new Error('Failed to fetch hippotherapy data'));
                }
            }, 1000);
        });
    },
};
