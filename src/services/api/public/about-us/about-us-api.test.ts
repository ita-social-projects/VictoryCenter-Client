import { AxiosInstance } from 'axios';
import { AboutUsApi } from './about-us-api';
import { AboutUsSection } from '../../../../types/public/about-us-page';
import { ContentType, SectionType } from '../../../../types/common/about-us';
import { Image } from '../../../../types/common/image';

describe('AboutUsApi', () => {
    let client: jest.Mocked<Pick<AxiosInstance, 'get'>>;

    beforeEach(() => {
        client = { get: jest.fn() } as any;
    });

    it('should return valid data', async () => {
        const data: AboutUsSection = {
            sectionType: SectionType.Main,
            contents: [
                {
                    id: 1,
                    contentType: ContentType.Image,
                    image: {
                        id: 1,
                        url: 'https://example.com/card/1',
                        mimeType: 'image/png',
                    } as Image,
                    title: null,
                    description: null,
                },
                { id: 2, contentType: ContentType.Title, title: 'Initial Title', image: null, description: null },
                {
                    id: 3,
                    contentType: ContentType.Description,
                    description: 'Initial Description',
                    title: null,
                    image: null,
                },
            ],
        };
        client.get.mockResolvedValue({ data } as any);

        await expect(AboutUsApi.get(client as unknown as AxiosInstance)).resolves.toEqual(data);
    });
});
