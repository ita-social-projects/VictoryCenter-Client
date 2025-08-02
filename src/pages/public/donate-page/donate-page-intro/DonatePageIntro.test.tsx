import { render, screen } from '@testing-library/react';
import React from 'react';

const mockPageTitle = (value: string) => {
    jest.resetModules();
    jest.doMock('../../../const/donate-page/donate-page', () => ({
        PAGE_TITLE: value,
    }));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('./DonatePageIntro');
};

describe('DonatePageIntro', () => {
    it('renders with line breaks if PAGE_TITLE contains |', () => {
        const { DonatePageIntro } = mockPageTitle('Part1 | Part2');
        render(<DonatePageIntro />);
        expect(screen.getByRole('heading').innerHTML).toContain('<br');
    });

    it('renders without line breaks if PAGE_TITLE does not contain |', () => {
        const { DonatePageIntro } = mockPageTitle('SingleTitle');
        render(<DonatePageIntro />);
        expect(screen.getByRole('heading')).toHaveTextContent('SingleTitle');
    });
});
