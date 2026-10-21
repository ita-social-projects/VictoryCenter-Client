import { fireEvent, screen } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

interface SectionTranslationProps {
    onTranslateClick?: () => void;
    isTranslateDisabled?: boolean;
}

const queryTranslateButton = () =>
    screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION });

export function createSectionTranslationTestSuite(renderSection: (props?: SectionTranslationProps) => void) {
    describe('translation icon', () => {
        it('does not render the translation icon without onTranslateClick', () => {
            renderSection();

            expect(queryTranslateButton()).not.toBeInTheDocument();
        });

        it('renders the translation icon and calls onTranslateClick when it is clicked', () => {
            const onTranslateClick = jest.fn();
            renderSection({ onTranslateClick });

            fireEvent.click(queryTranslateButton()!);

            expect(onTranslateClick).toHaveBeenCalledTimes(1);
        });

        it('disables the translation icon when isTranslateDisabled is true', () => {
            renderSection({ onTranslateClick: jest.fn(), isTranslateDisabled: true });

            expect(queryTranslateButton()).toBeDisabled();
        });
    });
}
