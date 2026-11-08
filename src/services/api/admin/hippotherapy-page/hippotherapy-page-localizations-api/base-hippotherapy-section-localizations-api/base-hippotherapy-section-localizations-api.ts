import { AxiosInstance } from 'axios';

const createSectionLocalization = async <TDto, TResponseDto>(
    client: AxiosInstance,
    url: string,
    data: TDto,
): Promise<TResponseDto> => {
    const response = await client.post<TResponseDto>(url, data);

    return response.data;
};

const updateSectionLocalization = async <TDto, TResponseDto>(
    client: AxiosInstance,
    url: string,
    entityId: number,
    languageId: number,
    data: TDto,
): Promise<TResponseDto> => {
    const response = await client.put<TResponseDto>(`${url}/${entityId}/${languageId}`, data);

    return response.data;
};

export const createSectionLocalizationsApi = <TCreateDto, TUpdateDto, TResponseDto>(url: string) => ({
    create: async (client: AxiosInstance, data: TCreateDto): Promise<TResponseDto> =>
        createSectionLocalization<TCreateDto, TResponseDto>(client, url, data),
    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: TUpdateDto,
    ): Promise<TResponseDto> =>
        updateSectionLocalization<TUpdateDto, TResponseDto>(client, url, entityId, languageId, data),
});
