import { render, screen } from '@testing-library/react';

import { LocalizationStatuses} from './LocalizationStatuses'; 
import styles from './LocalizationStatuses.module.scss';
import {
    TranslationStatus,
    LocalizationLanguage,
    EntityWithLocalizations,
    EntityLocalization,
} from '../../../types/common/language';

// --- Тестові дані ---
type TestLocalization = EntityLocalization;

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
    ],
};
// --------------------

describe('LocalizationStatuses component', () => {

    it('renders all language badges with correct codes', () => {
        render(<LocalizationStatuses languages={languages} localizedEntity={localizedEntity} />);

        expect(screen.getByText('EN')).toBeInTheDocument();
        expect(screen.getByText('ES')).toBeInTheDocument();
        expect(screen.getByText('PL')).toBeInTheDocument();
    });

    it('applies correct class based on translation status', () => {
        render(<LocalizationStatuses languages={languages} localizedEntity={localizedEntity} />);

        const enBadge = screen.getByText('EN');
        const esBadge = screen.getByText('ES');
        const plBadge = screen.getByText('PL');

        // Relevant (EN)
        expect(enBadge).toHaveClass(styles.badge);
        expect(enBadge).toHaveClass(styles.relevant);
        expect(enBadge).not.toHaveClass(styles.outdated);

        // Outdated (ES)
        expect(esBadge).toHaveClass(styles.badge);
        expect(esBadge).toHaveClass(styles.outdated);
        expect(esBadge).not.toHaveClass(styles.relevant);

        // Missing (PL)
        expect(plBadge).toHaveClass(styles.badge);
        expect(plBadge).not.toHaveClass(styles.relevant);
        expect(plBadge).not.toHaveClass(styles.outdated);
    });

    // 3. Тест на коректний data-testid
    it('renders wrapper with correct test id', () => {
        const { getByTestId } = render(<LocalizationStatuses languages={languages} localizedEntity={localizedEntity} />);

        expect(getByTestId('localization-statuses')).toBeInTheDocument();
    });
});
