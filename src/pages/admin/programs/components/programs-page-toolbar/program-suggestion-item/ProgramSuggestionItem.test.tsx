import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgramSuggestionItem } from './ProgramSuggestionItem';
import { ProgramSuggestion } from '../../../../../../types/admin/programs';

jest.mock('../../../../../../hooks/common/use-observe-element-size/useObserveElementSize');

const mockUseObserveElementSize =
    require('../../../../../../hooks/common/use-observe-element-size/useObserveElementSize').useObserveElementSize;

// Helper functions
const createSuggestion = (name: string, categories: string[]): ProgramSuggestion => ({
    id: 1,
    name,
    categories,
});

const createProps = (
    item: ProgramSuggestion = createSuggestion('Test Program', ['Category 1']),
    isHovered = false,
    onShowTooltip = jest.fn(),
) => ({
    item,
    isHovered,
    onShowTooltip,
});

const mockElement = (scrollWidth: number, clientWidth: number) => ({
    scrollWidth,
    clientWidth,
});

describe('ProgramSuggestionItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseObserveElementSize.mockReturnValue({ width: 100, height: 50 });
    });

    it('should render program name and categories', () => {
        const suggestion = createSuggestion('Test Program', ['Category 1', 'Category 2']);
        render(<ProgramSuggestionItem {...createProps(suggestion)} />);

        expect(screen.getByText('Test Program')).toBeInTheDocument();
        expect(screen.getByText('Category 1, Category 2')).toBeInTheDocument();
    });

    it('should render with correct CSS classes', () => {
        render(<ProgramSuggestionItem {...createProps()} />);

        expect(screen.getByText('Test Program')).toHaveClass('program-suggestion-item__name');
        expect(screen.getByText('Category 1')).toHaveClass('program-suggestion-item__categories');
        expect(screen.getByText('Test Program').closest('div')).toHaveClass('program-suggestion-item');
    });

    it('should join categories with comma and space', () => {
        const suggestion = createSuggestion('Program', ['Cat A', 'Cat B', 'Cat C']);
        render(<ProgramSuggestionItem {...createProps(suggestion)} />);

        expect(screen.getByText('Cat A, Cat B, Cat C')).toBeInTheDocument();
    });

    it('should render empty categories when no categories provided', () => {
        const suggestion = createSuggestion('Program', []);
        render(<ProgramSuggestionItem {...createProps(suggestion)} />);

        const categoriesElement = screen
            .getByText('Program')
            .parentElement?.querySelector('.program-suggestion-item__categories');
        expect(categoriesElement).toHaveTextContent('');
    });

    it('should call useObserveElementSize with correct props when not hovered', () => {
        render(<ProgramSuggestionItem {...createProps(createSuggestion('Test', []), false)} />);

        expect(mockUseObserveElementSize).toHaveBeenCalledWith({
            observableElement: expect.any(Object),
            onSizeChanged: expect.any(Function),
            disableWhen: true,
        });
    });

    it('should call useObserveElementSize with correct props when hovered', () => {
        render(<ProgramSuggestionItem {...createProps(createSuggestion('Test', []), true)} />);

        expect(mockUseObserveElementSize).toHaveBeenCalledWith({
            observableElement: expect.any(Object),
            onSizeChanged: expect.any(Function),
            disableWhen: false,
        });
    });

    it('should show tooltip when name element is overflowing', () => {
        const onShowTooltip = jest.fn();

        // Mock refs to simulate overflow
        jest.spyOn(React, 'useRef')
            .mockReturnValueOnce({ current: mockElement(200, 100) }) // nameRef - overflowing
            .mockReturnValueOnce({ current: mockElement(50, 100) }) // categoriesRef - not overflowing
            .mockReturnValueOnce({ current: document.createElement('div') }); // containerRef

        render(
            <ProgramSuggestionItem
                {...createProps(createSuggestion('Long Program Name', ['Cat']), true, onShowTooltip)}
            />,
        );

        // Get the onSizeChanged callback and call it
        const onSizeChangedCallback = mockUseObserveElementSize.mock.calls[0][0].onSizeChanged;
        onSizeChangedCallback({ width: 100, height: 50 });

        expect(onShowTooltip).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should show tooltip when categories element is overflowing', () => {
        const onShowTooltip = jest.fn();

        jest.spyOn(React, 'useRef')
            .mockReturnValueOnce({ current: mockElement(50, 100) }) // nameRef - not overflowing
            .mockReturnValueOnce({ current: mockElement(200, 100) }) // categoriesRef - overflowing
            .mockReturnValueOnce({ current: document.createElement('div') });

        render(
            <ProgramSuggestionItem
                {...createProps(createSuggestion('Name', ['Very Long Category Name']), true, onShowTooltip)}
            />,
        );

        const onSizeChangedCallback = mockUseObserveElementSize.mock.calls[0][0].onSizeChanged;
        onSizeChangedCallback({ width: 100, height: 50 });

        expect(onShowTooltip).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should not show tooltip when no elements are overflowing', () => {
        const onShowTooltip = jest.fn();

        jest.spyOn(React, 'useRef')
            .mockReturnValueOnce({ current: mockElement(50, 100) }) // nameRef - not overflowing
            .mockReturnValueOnce({ current: mockElement(50, 100) }) // categoriesRef - not overflowing
            .mockReturnValueOnce({ current: document.createElement('div') });

        render(<ProgramSuggestionItem {...createProps(createSuggestion('Short', ['Cat']), true, onShowTooltip)} />);

        const onSizeChangedCallback = mockUseObserveElementSize.mock.calls[0][0].onSizeChanged;
        onSizeChangedCallback({ width: 100, height: 50 });

        expect(onShowTooltip).toHaveBeenCalledWith(null);
    });

    it('should call onShowTooltip when size changes', () => {
        const onShowTooltip = jest.fn();

        render(
            <ProgramSuggestionItem
                {...createProps(createSuggestion('Program Name', ['Cat 1']), true, onShowTooltip)}
            />,
        );

        const onSizeChangedCallback = mockUseObserveElementSize.mock.calls[0][0].onSizeChanged;
        onSizeChangedCallback({ width: 100, height: 50 });

        expect(onShowTooltip).toHaveBeenCalledTimes(1);
    });
});
