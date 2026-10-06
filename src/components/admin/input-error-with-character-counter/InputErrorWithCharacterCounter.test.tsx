import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InputErrorWithCharacterCounter } from './InputErrorWithCharacterCounter';

jest.mock('./InputErrorWithCharacterCounter.module.scss', () => ({}));

describe('InputErrorWithCharacterCounter', () => {
    const props = { maxLength: 60, counterId: 'c', htmlFor: 'i' };

    it('computes length from value without trailing spaces', () => {
        render(<InputErrorWithCharacterCounter {...props} value="Hello  " />);
        expect(screen.getByText('5/60')).toBeInTheDocument();
    });

    it('prefers explicit currentLength over value', () => {
        render(<InputErrorWithCharacterCounter {...props} value="<p>Hello</p>" currentLength={5} />);
        expect(screen.getByText('5/60')).toBeInTheDocument();
    });

    it('uses currentLength even when it is 0', () => {
        render(<InputErrorWithCharacterCounter {...props} value="<p></p>" currentLength={0} />);
        expect(screen.getByText('0/60')).toBeInTheDocument();
    });
});
