import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslateEventCategory } from './useTranslateEventCategory';
import { EventCategoryLocalizationsApi } from '@/services/api/admin/events/event-category-localization-api/event-category-localization-api';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { EVENT_CATEGORY_TEXT } from '@/const/admin/events';
import { EventCategoryDto } from '@/types/admin/event-category';
import { LocalizationLanguage } from '@/types/common/language';
import { TranslateEventCategoryFormValues } from '@/pages/admin/events/translate-event-category-form/TranslateEventCategoryForm';

jest.mock('@/services/api/admin/events/event-category-localization-api/event-category-localization-api', () => ({
    EventCategoryLocalizationsApi: {
        create: jest.fn(),
    },
}));

jest.mock('../use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

describe('useTranslateEventCategory', () => {
    const mockLanguage: LocalizationLanguage = {
        id: 2,
        code: 'en',
        name: 'English',
    };

    const mockCategory: EventCategoryDto = {
        id: 1,
        name: 'Original Category',
        relatedEventNewsCount: 0,
        localizations: [],
    };

    const mockFormData: TranslateEventCategoryFormValues = {
        name: 'Translated Category',
    };

    const mockAdminClient = { get: jest.fn(), post: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAdminClient as jest.Mock).mockReturnValue(mockAdminClient);
    });

    it('successfully creates a translation and calls onSuccess', async () => {
        const mockOnSuccess = jest.fn();
        const createdLocalizationDto = {
            entityId: 1,
            language: mockLanguage as any,
            name: 'Translated Category',
            translationStatus: 1,
        };

        (EventCategoryLocalizationsApi.create as jest.Mock).mockResolvedValueOnce(createdLocalizationDto);

        const { result } = renderHook(() =>
            useTranslateEventCategory({
                category: mockCategory,
                language: mockLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        let promise: Promise<void>;
        act(() => {
            promise = result.current.translateEventCategory(mockFormData);
        });

        expect(result.current.isSubmitting).toBe(true);

        await act(async () => {
            await promise;
        });

        expect(result.current.isSubmitting).toBe(false);
        expect(EventCategoryLocalizationsApi.create).toHaveBeenCalledWith(mockAdminClient, {
            entityId: mockCategory.id,
            languageId: mockLanguage.id,
            name: mockFormData.name,
        });

        expect(mockOnSuccess).toHaveBeenCalledWith({
            ...mockCategory,
            localizations: [createdLocalizationDto],
        });
        expect(result.current.error).toBe('');
    });

    it('sets an error state when the API call fails', async () => {
        const mockOnSuccess = jest.fn();

        (EventCategoryLocalizationsApi.create as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        const { result } = renderHook(() =>
            useTranslateEventCategory({
                category: mockCategory,
                language: mockLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateEventCategory(mockFormData);
        });

        expect(result.current.isSubmitting).toBe(false);
        expect(EventCategoryLocalizationsApi.create).toHaveBeenCalled();
        expect(mockOnSuccess).not.toHaveBeenCalled();
        expect(result.current.error).toBe(EVENT_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_TRANSLATE);
    });

    it('does not proceed if category is missing', async () => {
        const mockOnSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateEventCategory({
                category: null,
                language: mockLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateEventCategory(mockFormData);
        });

        expect(EventCategoryLocalizationsApi.create).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('does not proceed if language is missing', async () => {
        const mockOnSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateEventCategory({
                category: mockCategory,
                language: null,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateEventCategory(mockFormData);
        });

        expect(EventCategoryLocalizationsApi.create).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('clears the error state when clearError is called', async () => {
        const { result } = renderHook(() =>
            useTranslateEventCategory({
                category: mockCategory,
                language: mockLanguage,
                onSuccess: jest.fn(),
            }),
        );

        (EventCategoryLocalizationsApi.create as jest.Mock).mockRejectedValueOnce(new Error('error'));

        await act(async () => {
            await result.current.translateEventCategory(mockFormData);
        });

        expect(result.current.error).toBeTruthy();

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBe('');
    });
});
