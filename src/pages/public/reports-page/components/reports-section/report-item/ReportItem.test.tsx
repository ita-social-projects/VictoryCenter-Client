import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportItem } from './ReportItem';

jest.mock('./ReportItem.module.scss', () => ({
    root: 'root-class',
    year: 'year-class',
}));

jest.mock('@/assets/icons/arrow-down-to-line.svg', () => ({
    ReactComponent: () => <svg data-testid="arrow-icon-mock" />,
}));

jest.mock('@/components/public/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => (
        <button onClick={onClick} data-testid="button-mock" data-props={JSON.stringify(props)}>
            {children}
        </button>
    ),
}));

describe('ReportItem', () => {
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders label and button correctly', () => {
        render(<ReportItem label="2024" buttonLabel="Download Report" />);

        const yearLabel = screen.getByText('2024');
        const button = screen.getByTestId('button-mock');

        expect(yearLabel).toBeInTheDocument();
        expect(yearLabel).toHaveClass('year-class');
        expect(button).toHaveTextContent('Download Report');
    });

    it('passes correct configuration to Button', () => {
        render(<ReportItem label="2024" buttonLabel="Download" />);

        const button = screen.getByTestId('button-mock');
        const props = JSON.parse(button.getAttribute('data-props') || '{}');

        expect(props).toMatchObject({
            variant: 'tertiary',
            iconPosition: 'right',
        });
    });

    it('opens fileUrl in new tab on click', () => {
        const fileUrl = 'https://example.com/report.pdf';
        render(<ReportItem label="2024" buttonLabel="Download" fileUrl={fileUrl} />);

        const button = screen.getByTestId('button-mock');
        fireEvent.click(button);

        expect(windowOpenSpy).toHaveBeenCalledTimes(1);
        expect(windowOpenSpy).toHaveBeenCalledWith(fileUrl, '_blank');
    });

    it('does not open window if fileUrl is missing', () => {
        render(<ReportItem label="2024" buttonLabel="Download" />);

        const button = screen.getByTestId('button-mock');
        fireEvent.click(button);

        expect(windowOpenSpy).not.toHaveBeenCalled();
    });
});
