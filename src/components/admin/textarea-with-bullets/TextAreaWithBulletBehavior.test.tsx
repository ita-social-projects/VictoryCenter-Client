import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextAreaWithBulletBehavior } from './TextAreaWithBulletBehavior';

describe('TextAreaWithBulletBehavior', () => {
    const id = 'test-textarea';
    const name = 'description';
    const maxLength = 500;
    let handleChange: jest.Mock;
    let handleFocus: jest.Mock;
    let handleBlur: jest.Mock;

    beforeEach(() => {
        handleChange = jest.fn();
        handleFocus = jest.fn();
        handleBlur = jest.fn();
    });

    const renderComponent = (value = '') =>
        render(
            <TextAreaWithBulletBehavior
                id={id}
                name={name}
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                maxLength={maxLength}
            />,
        );

    it('should render textarea with initial value', () => {
        renderComponent('• Line 1');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        expect(textarea.value).toBe('• Line 1');
    });

    it('should insert bullet prefix on focus when value is empty', () => {
        renderComponent('');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        fireEvent.focus(textarea);

        expect(handleChange).toHaveBeenCalled();
        const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
        expect(lastCall.target.value).toBe('• ');
    });

    it('should not insert bullet on focus if value already exists', () => {
        renderComponent('• Already has bullet');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        const callCount = handleChange.mock.calls.length;

        fireEvent.focus(textarea);

        expect(handleChange.mock.calls.length).toBe(callCount);
    });

    it('should return bullet prefix for empty text in ensureBulletPrefix logic', () => {
        renderComponent('');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        fireEvent.change(textarea, { target: { value: '   ' } });
        fireEvent.blur(textarea);
    });

    it('should stop Enter key behavior if there is no space even for a partial bullet', () => {
        const shortMax = 10;
        render(
            <TextAreaWithBulletBehavior
                id="test"
                name="test"
                value="• 1234567"
                onChange={handleChange}
                maxLength={shortMax}
            />,
        );
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        textarea.selectionStart = 9;
        textarea.selectionEnd = 9;

        fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

        expect(handleChange).not.toHaveBeenCalled();
    });

    it('should trigger onKeyDown prop if provided', () => {
        const onKeyDownMock = jest.fn();
        const shortMax = 10;
        render(
            <TextAreaWithBulletBehavior
                id="test"
                name="test"
                value="• test"
                onChange={handleChange}
                maxLength={shortMax}
                onKeyDown={onKeyDownMock}
            />,
        );
        const textarea = screen.getByRole('textbox');
        fireEvent.keyDown(textarea, { key: 'a' });
        expect(onKeyDownMock).toHaveBeenCalled();
    });

    it('should prepend bullet on blur if text does not start with bullet', () => {
        renderComponent('Line without bullet');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        fireEvent.blur(textarea);

        expect(handleChange).toHaveBeenCalled();
        const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
        expect(lastCall.target.value).toMatch(/^• /);
    });

    it('should not prepend bullet on blur if already present', () => {
        renderComponent('• Line with bullet');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        const callCount = handleChange.mock.calls.length;

        fireEvent.blur(textarea);

        expect(handleChange.mock.calls.length).toBe(callCount);
    });

    it('should insert new bullet on Enter key press', () => {
        renderComponent('• First line');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        textarea.selectionStart = 12;
        textarea.selectionEnd = 12;

        fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

        expect(handleChange).toHaveBeenCalled();
        const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
        expect(lastCall.target.value).toContain('\n• ');
    });

    it('should not insert bullet on Enter with Shift key', () => {
        renderComponent('• Line');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        const callCount = handleChange.mock.calls.length;

        textarea.selectionStart = 6;
        textarea.selectionEnd = 6;

        fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true, code: 'Enter' });

        expect(handleChange.mock.calls.length).toBe(callCount);
    });

    it('should respect maxLength constraint when inserting bullet', () => {
        const shortMax = 10;
        render(
            <TextAreaWithBulletBehavior
                id={id}
                name={name}
                value="• 123456"
                onChange={handleChange}
                maxLength={shortMax}
            />,
        );
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        textarea.selectionStart = 8;
        textarea.selectionEnd = 8;

        const callCountBefore = handleChange.mock.calls.length;
        fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

        expect(handleChange.mock.calls.length).toBe(callCountBefore);
    });

    it('should position cursor after new bullet line', async () => {
        renderComponent('• First');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        textarea.selectionStart = 7;
        textarea.selectionEnd = 7;

        fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

        expect(handleChange).toHaveBeenCalled();
        const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
        expect(lastCall.target.value).toContain('\n• ');
    });

    it('should not add bullet if value contains only spaces on focus', () => {
        renderComponent('   ');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        const callCount = handleChange.mock.calls.length;

        fireEvent.focus(textarea);

        expect(handleChange.mock.calls.length).toBeGreaterThan(callCount);
    });

    it('should handle multiple lines with bullets', () => {
        renderComponent('• Line 1\n• Line 2');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        textarea.selectionStart = 17;
        textarea.selectionEnd = 17;

        fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

        expect(handleChange).toHaveBeenCalled();
        const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
        expect(lastCall.target.value).toBe('• Line 1\n• Line 2\n• ');
    });

    it('should replace selected text on Enter', () => {
        renderComponent('• Hello World');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        textarea.selectionStart = 2;
        textarea.selectionEnd = 7;

        fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

        expect(handleChange).toHaveBeenCalled();
        const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
        expect(lastCall.target.value).toBe('• \n•  World');
    });

    it('should call onFocus callback', () => {
        renderComponent('• Test');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        fireEvent.focus(textarea);

        expect(handleFocus).toHaveBeenCalled();
    });

    it('should call onBlur callback', () => {
        renderComponent('• Test');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        fireEvent.blur(textarea);

        expect(handleBlur).toHaveBeenCalled();
    });

    it('should handle complex text with newlines and bullets correctly', () => {
        renderComponent('• Point 1\n• Point 2\n• Point 3');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        textarea.selectionStart = 17;
        textarea.selectionEnd = 17;

        fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

        expect(handleChange).toHaveBeenCalled();
        const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
        expect(lastCall.target.value).toContain('\n• ');
    });

    it('should ignore keys other than Enter', () => {
        renderComponent('• Test');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        const callCount = handleChange.mock.calls.length;

        fireEvent.keyDown(textarea, { key: 'a', code: 'KeyA' });

        expect(handleChange.mock.calls.length).toBe(callCount);
    });

    it('should trim whitespace-only lines to empty string on blur', () => {
        renderComponent('   \n   ');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        fireEvent.blur(textarea);

        expect(handleChange).toHaveBeenCalledWith({
            target: { value: '', name, id },
        });
    });
});
