import {
    ReportsMediaSettingsCollectedFundsDto,
    ReportsMediaSettingsChangedLivesDto,
    ReportsMediaSettingsDto,
} from '@/types/admin/reports';
import {
    mapReportsMediaSettingsDtoToMediaSettings,
    mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds,
    mapReportsMediaSettingsChangedLivesDtoToChangedLives,
} from './reports-mapper';

describe('reports-mapper', () => {
    describe('mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds', () => {
        it('should map dto with image correctly', () => {
            const dto: ReportsMediaSettingsCollectedFundsDto = {
                title: 'Зібрані кошти',
                collectedAmount: 250000,
                image: { id: 10, url: 'https://img/cf.png', mimeType: 'image/png' },
                imageId: 10,
            };

            const result = mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds(dto);

            expect(result).toEqual({
                title: 'Зібрані кошти',
                collectedFunds: 250000,
                image: dto.image,
                imageId: 10,
            });
        });

        it('should map collectedAmount to collectedFunds', () => {
            const dto: ReportsMediaSettingsCollectedFundsDto = {
                title: 'Title',
                collectedAmount: 999,
                image: { id: 5, url: 'https://img/5.png', mimeType: 'image/jpeg' },
                imageId: 5,
            };

            const result = mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds(dto);

            expect(result.collectedFunds).toBe(999);
        });

        it('should set imageId from image.id when image is present', () => {
            const dto: ReportsMediaSettingsCollectedFundsDto = {
                title: 'Title',
                collectedAmount: 100,
                image: { id: 42, url: 'https://img/42.png', mimeType: 'image/png' },
                imageId: 99,
            };

            const result = mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds(dto);

            expect(result.imageId).toBe(42);
        });

        it('should set imageId to null when image is null', () => {
            const dto: ReportsMediaSettingsCollectedFundsDto = {
                title: 'Title',
                collectedAmount: 0,
                image: null,
                imageId: null,
            };

            const result = mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds(dto);

            expect(result.imageId).toBeNull();
            expect(result.image).toBeNull();
        });
    });

    describe('mapReportsMediaSettingsChangedLivesDtoToChangedLives', () => {
        it('should map dto with image correctly', () => {
            const dto: ReportsMediaSettingsChangedLivesDto = {
                title: 'Змінені життя',
                changedLives: 56,
                image: { id: 20, url: 'https://img/cl.png', mimeType: 'image/png' },
                imageId: 20,
            };

            const result = mapReportsMediaSettingsChangedLivesDtoToChangedLives(dto);

            expect(result).toEqual({
                title: 'Змінені життя',
                changedLives: 56,
                image: dto.image,
                imageId: 20,
            });
        });

        it('should set imageId from image.id when image is present', () => {
            const dto: ReportsMediaSettingsChangedLivesDto = {
                title: 'Title',
                changedLives: 10,
                image: { id: 33, url: 'https://img/33.png', mimeType: 'image/jpeg' },
                imageId: 50,
            };

            const result = mapReportsMediaSettingsChangedLivesDtoToChangedLives(dto);

            expect(result.imageId).toBe(33);
        });

        it('should set imageId to null when image is null', () => {
            const dto: ReportsMediaSettingsChangedLivesDto = {
                title: 'Title',
                changedLives: 0,
                image: null,
                imageId: null,
            };

            const result = mapReportsMediaSettingsChangedLivesDtoToChangedLives(dto);

            expect(result.imageId).toBeNull();
            expect(result.image).toBeNull();
        });
    });

    describe('mapReportsMediaSettingsDtoToMediaSettings', () => {
        it('should map full dto with both blocks', () => {
            const dto: ReportsMediaSettingsDto = {
                collectedFundsBlock: {
                    title: 'CF Title',
                    collectedAmount: 300000,
                    image: { id: 1, url: 'https://img/1.png', mimeType: 'image/png' },
                    imageId: 1,
                },
                changedLivesBlock: {
                    title: 'CL Title',
                    changedLives: 100,
                    image: { id: 2, url: 'https://img/2.png', mimeType: 'image/jpeg' },
                    imageId: 2,
                },
            };

            const result = mapReportsMediaSettingsDtoToMediaSettings(dto);

            expect(result).toEqual({
                collectedFunds: {
                    title: 'CF Title',
                    collectedFunds: 300000,
                    image: dto.collectedFundsBlock.image,
                    imageId: 1,
                },
                changedLives: {
                    title: 'CL Title',
                    changedLives: 100,
                    image: dto.changedLivesBlock.image,
                    imageId: 2,
                },
            });
        });

        it('should handle null images in both blocks', () => {
            const dto: ReportsMediaSettingsDto = {
                collectedFundsBlock: {
                    title: 'Empty CF',
                    collectedAmount: 0,
                    image: null,
                    imageId: null,
                },
                changedLivesBlock: {
                    title: 'Empty CL',
                    changedLives: 0,
                    image: null,
                    imageId: null,
                },
            };

            const result = mapReportsMediaSettingsDtoToMediaSettings(dto);

            expect(result.collectedFunds.imageId).toBeNull();
            expect(result.collectedFunds.image).toBeNull();
            expect(result.changedLives.imageId).toBeNull();
            expect(result.changedLives.image).toBeNull();
        });
    });
});
