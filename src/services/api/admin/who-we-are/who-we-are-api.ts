import {AxiosInstance} from "axios";
import {API_ROUTES} from "../../../../const/common/api-routes/main-api";
import {WhoWeAreCategory} from "../../../../types/admin/who-we-are";

export const WhoWeAreApi = {
    getAll: async (client: AxiosInstance): Promise<WhoWeAreCategory[]>=> {
        const response = await client.get(`${API_ROUTES.WHO_WE_ARE.Base}`);
        return response.data as WhoWeAreCategory[];
}
}