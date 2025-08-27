import React from 'react';
import { render, screen } from '@testing-library/react';
import { PhotoInputGroup } from './PhotoInputGroup';

jest.mock('../../input-label/InputLabel', () => ({
    InputLabel: ({ text }: { text: string }) => <div data-testid="mock-label">{text}</div>,
}));

jest.mock('../../image-input/ImageInput', () => ({
    PhotoInput: () => <input data-testid="mock-image-input" />,
}));

jest.mock('../../input-error/InputError', () => ({
    InputError: () => <div data-testid="mock-error">Error</div>,
}));

describe('PhotoInputGroup', () => {
    it('renders label, photo input and error', () => {
        render(<PhotoInputGroup name="test" id="test" label="Test Photo Label" value={null} onChange={() => {}} />);

        expect(screen.getByTestId('mock-label')).toBeInTheDocument();
        expect(screen.getByTestId('mock-image-input')).toBeInTheDocument();
        expect(screen.getByTestId('mock-error')).toBeInTheDocument();
    });
});
