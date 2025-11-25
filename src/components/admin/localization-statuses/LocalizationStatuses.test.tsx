import { render, screen } from '@testing-library/react';
import { LocalizationStatuses, getLocalizationClassNameFromStatus } from './LocalizationStatuses';
import {
    TranslationStatus,
    LocalizationLanguage,
    EntityWithLocalizations,
    EntityLocalization,
} from '../../../types/common/language';

type TestLocalization = EntityLocalization;

describe('LocalizationStatuses component', () => {
    const languages: LocalizationLanguage[] = [
        { id: 1, code: 'en', name: 'Англійська' },
        { id: 2, code: 'es', name: 'Іспанська' },
        { id: 3, code: 'pl', name: 'Польська' },
    ];

    const localizedEntity: EntityWithLocalizations<TestLocalization> = {
        localizations: [
            {
                language: { id: 1, code: 'en' },
                translationStatus: TranslationStatus.Relevant,
            },
            {
                language: { id: 2, code: 'es' },
                translationStatus: TranslationStatus.Outdated,
            },
            // pl intentionally missing to test "status-missing"
        ],
    };

    it('renders all language badges', () => {
        render(<LocalizationStatuses languages={languages} localizedEntity={localizedEntity} />);

        expect(screen.getByText('EN')).toBeInTheDocument();
        expect(screen.getByText('ES')).toBeInTheDocument();
        expect(screen.getByText('PL')).toBeInTheDocument();
    });

    it('applies correct class based on translation status', () => {
        render(<LocalizationStatuses languages={languages} localizedEntity={localizedEntity} />);

        const enBadge = screen.getByText('EN');
        const ukBadge = screen.getByText('ES');
        const plBadge = screen.getByText('PL');

        expect(enBadge).toHaveClass('badge status-relevant');
        expect(ukBadge).toHaveClass('badge status-outdated');
        expect(plBadge).toHaveClass('badge status-missing');
    });

    it('renders wrapper with correct test id', () => {
        const { container } = render(<LocalizationStatuses languages={languages} localizedEntity={localizedEntity} />);

        expect(container.querySelector('[data-testId="localization-statuses"]')).toBeInTheDocument();
    });
});

describe('getLocalizationClassNameFromStatus', () => {
    const language: LocalizationLanguage = {
        id: 1,
        code: 'en',
        name: 'Англійська',
    };

    const baseEntity = (status?: TranslationStatus): EntityWithLocalizations<TestLocalization> => ({
        localizations:
            status !== undefined
                ? [
                      {
                          language: { id: 1, code: 'en' },
                          translationStatus: status,
                      },
                  ]
                : [],
    });

    it('returns status-relevant when translation is Relevant', () => {
        const result = getLocalizationClassNameFromStatus(language, baseEntity(TranslationStatus.Relevant));

        expect(result).toBe('status-relevant');
    });

    it('returns status-outdated when translation is Outdated', () => {
        const result = getLocalizationClassNameFromStatus(language, baseEntity(TranslationStatus.Outdated));

        expect(result).toBe('status-outdated');
    });

    it('returns status-missing when localization not found', () => {
        const result = getLocalizationClassNameFromStatus(language, baseEntity());

        expect(result).toBe('status-missing');
    });
});
