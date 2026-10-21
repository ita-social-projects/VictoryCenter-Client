import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { SectionTranslationHeader } from './SectionTranslationHeader';

describe('SectionTranslationHeader', () => {
    const translateButton = () =>
        screen.getByRole('button', { name: COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION });

    it('calls onTranslateClick when the translation icon is clicked', () => {
        const onTranslateClick = jest.fn();
        render(<SectionTranslationHeader onTranslateClick={onTranslateClick} />);

        fireEvent.click(translateButton());

        expect(onTranslateClick).toHaveBeenCalledTimes(1);
    });

    it('disables the translation icon when isTranslateDisabled is true', () => {
        const onTranslateClick = jest.fn();
        render(<SectionTranslationHeader onTranslateClick={onTranslateClick} isTranslateDisabled />);

        expect(translateButton()).toBeDisabled();
        fireEvent.click(translateButton());
        expect(onTranslateClick).not.toHaveBeenCalled();
    });
});
