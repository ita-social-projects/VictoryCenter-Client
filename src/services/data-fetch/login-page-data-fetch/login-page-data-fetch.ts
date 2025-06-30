import axios from "axios";
import { Credentials } from "../../../types/AdminContext";
import { authEndpoints } from "../../../const/urls/main-api";

interface RefreshTokenRequest {
    expiredAccessToken: string;
    refreshToken: string;
}
interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

export const loginRequest = async (creds: Credentials): Promise<string> => {
    const response = await axios.post<RefreshTokenResponse>(authEndpoints.login, creds);
    return response.data.accessToken;
};

export const tokenRefreshRequest = async (token: string): Promise<string> => {
    const payload: RefreshTokenRequest = {
        expiredAccessToken : token,
        refreshToken : 'asdas'
    };

    const response = await axios.post<RefreshTokenResponse>(authEndpoints.refresh, payload, {withCredentials: true});
    return response.data.accessToken;
};

// export const loginRequest = async (creds: Credentials): Promise<string> => {
//     const response = await axios.post<string>(authEndpoints.login, creds);
//     return response.data;
// };

// export const tokenRefreshRequest = async (token: string): Promise<string> => {
//     const response = await axios.post<string>(authEndpoints.refresh, token);
//     return response.data;
// };
