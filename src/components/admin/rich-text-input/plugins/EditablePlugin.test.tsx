import { render } from '@testing-library/react';
import { EditablePlugin } from './EditablePlugin';

const mockSetEditable = jest.fn();
const mockEditor = {
    setEditable: mockSetEditable,
};

jest.mock('@lexical/react/LexicalComposerContext', () => ({
    useLexicalComposerContext: () => [mockEditor],
}));

describe('EditablePlugin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('disables the editor when disabled is true', () => {
        render(<EditablePlugin disabled />);

        expect(mockSetEditable).toHaveBeenCalledWith(false);
    });

    it('updates editor editability when disabled changes', () => {
        const { rerender } = render(<EditablePlugin disabled={false} />);

        expect(mockSetEditable).toHaveBeenLastCalledWith(true);

        rerender(<EditablePlugin disabled />);

        expect(mockSetEditable).toHaveBeenLastCalledWith(false);
    });
});
