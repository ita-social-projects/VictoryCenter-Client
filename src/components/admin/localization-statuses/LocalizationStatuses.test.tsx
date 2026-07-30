import { render, screen } from '@testing-library/react';
import { LocalizationStatuses } from './LocalizationStatuses';
import styles from './LocalizationStatuses.module.scss';
import {
    TranslationStatus,
    LocalizationLanguage,
    EntityWithLocalizations,
    EntityLocalization,
    EntityWithTranslationStatuses,
} from '@/types/common/language';

type TestLocalization = EntityLocalization;

const languages: LocalizationLanguage[] = [
    { id: 1, code: 'en', name: 'Англійська' },
    { id: 2, code: 'es', name: 'Іспанська' },
    { id: 3, code: 'pl', name: 'Польська' },
];

const translationStatusesByLanguage = [
    {
        languageId: 1,
        languageCode: 'en',
        translationStatus: TranslationStatus.Relevant,
    },
    {
        languageId: 2,
        languageCode: 'es',
        translationStatus: TranslationStatus.Outdated,
    },
];

const localizedEntity: EntityWithLocalizations<TestLocalization> = {
    localizations: translationStatusesByLanguage.map(({ languageId, languageCode, translationStatus }) => ({
        language: { id: languageId, code: languageCode },
        translationStatus,
    })),
};

const entityWithTranslationStatuses: EntityWithTranslationStatuses = {
    translationStatuses: translationStatusesByLanguage.map(({ languageId, translationStatus }) => ({
        languageId,
        translationStatus,
    })),
};

const assertStatusBadges = () => {
    const enBadge = screen.getByText('EN');
    const esBadge = screen.getByText('ES');
    const plBadge = screen.getByText('PL');

    expect(enBadge).toHaveClass(styles.badge);
    expect(enBadge).toHaveClass(styles.relevant);
    expect(enBadge).not.toHaveClass(styles.outdated);

    expect(esBadge).toHaveClass(styles.badge);
    expect(esBadge).toHaveClass(styles.outdated);
    expect(esBadge).not.toHaveClass(styles.relevant);

    expect(plBadge).toHaveClass(styles.badge);
    expect(plBadge).not.toHaveClass(styles.relevant);
    expect(plBadge).not.toHaveClass(styles.outdated);
};

describe('LocalizationStatuses component', () => {
    it('renders all language badges with correct codes', () => {
        render(<LocalizationStatuses languages={languages} localizedEntity={localizedEntity} />);

        expect(screen.getByText('EN')).toBeInTheDocument();
        expect(screen.getByText('ES')).toBeInTheDocument();
        expect(screen.getByText('PL')).toBeInTheDocument();
    });

    it('applies correct class based on translation status', () => {
        render(<LocalizationStatuses languages={languages} localizedEntity={localizedEntity} />);

        assertStatusBadges();
    });

    it('renders wrapper with correct test id', () => {
        render(<LocalizationStatuses languages={languages} localizedEntity={localizedEntity} />);

        expect(screen.getByTestId('localization-statuses')).toBeInTheDocument();
    });

    it('applies statuses correctly for entities with translationStatuses', () => {
        render(<LocalizationStatuses languages={languages} localizedEntity={entityWithTranslationStatuses} />);

        assertStatusBadges();
    });

    it('falls back to localizations when translationStatuses is empty', () => {
        const entityWithEmptyStatuses = {
            translationStatuses: [],
            localizations: translationStatusesByLanguage.map(({ languageId, languageCode, translationStatus }) => ({
                language: { id: languageId, code: languageCode },
                translationStatus,
            })),
        };

        render(<LocalizationStatuses languages={languages} localizedEntity={entityWithEmptyStatuses} />);

        assertStatusBadges();
    });

    it('renders default red badge for all languages when entity has neither translationStatuses nor localizations', () => {
        render(<LocalizationStatuses languages={languages} localizedEntity={{}} />);

        const enBadge = screen.getByText('EN');
        const esBadge = screen.getByText('ES');
        const plBadge = screen.getByText('PL');

        expect(enBadge).not.toHaveClass(styles.relevant);
        expect(enBadge).not.toHaveClass(styles.outdated);
        expect(esBadge).not.toHaveClass(styles.relevant);
        expect(esBadge).not.toHaveClass(styles.outdated);
        expect(plBadge).not.toHaveClass(styles.relevant);
        expect(plBadge).not.toHaveClass(styles.outdated);
    });

    it('handles localizations with localizationInfoDto property correctly', () => {
        const entityWithDtoLocalizations = {
            localizations: [
                {
                    localizationInfoDto: { id: 1, code: 'en' },
                    translationStatus: TranslationStatus.Relevant,
                },
                {
                    localizationInfoDto: { id: 2, code: 'es' },
                    translationStatus: TranslationStatus.Outdated,
                },
            ],
        };

        render(<LocalizationStatuses languages={languages} localizedEntity={entityWithDtoLocalizations as any} />);

        assertStatusBadges();
    });
});
