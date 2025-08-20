import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { ProgramSuggestionItem, ProgramSuggestionItemProps } from './ProgramSuggestionItem';
import { SuggestionContentRef } from '../../../../../../components/admin/search-bar/suggestion-wrapper/SuggestionWrapper';
import { ProgramSuggestion } from '../../../../../../types/admin/programs';

const defaultProps: ProgramSuggestionItemProps = {
    item: {
        id: 1,
        name: 'Test Program',
        categories: ['Category 1', 'Category 2'],
    } as ProgramSuggestion,
};

const renderComponent = (props: Partial<ProgramSuggestionItemProps> = {}) => {
    const finalProps: ProgramSuggestionItemProps = { ...defaultProps, ...props };
    const ref = createRef<SuggestionContentRef>();

    const renderResult = render(<ProgramSuggestionItem {...finalProps} ref={ref} />);

    return { ref, ...renderResult };
};

describe('ProgramSuggestionItem', () => {
    it('should render program name correctly', () => {
        const testName: string = 'My Test Program';
        const testItem: ProgramSuggestion = {
            ...defaultProps.item,
            name: testName,
        };
        renderComponent({ item: testItem });

        expect(screen.getByText(testName)).toBeInTheDocument();
    });

    it('should render categories as comma-separated text', () => {
        const testCategories: string[] = ['Sports', 'Health', 'Education'];
        const testItem: ProgramSuggestion = {
            ...defaultProps.item,
            categories: testCategories,
        };
        renderComponent({ item: testItem });

        expect(screen.getByText('Sports, Health, Education')).toBeInTheDocument();
    });

    it('should render empty categories correctly', () => {
        const testItem: ProgramSuggestion = {
            ...defaultProps.item,
            categories: [],
        };
        renderComponent({ item: testItem });

        const categoriesElement: HTMLElement = screen.getByText(defaultProps.item.name)
            .nextElementSibling as HTMLElement;
        expect(categoriesElement).toHaveClass('program-suggestion-item__categories');
        expect(categoriesElement).toHaveTextContent('');
    });

    it('should return null for tooltip when neither name nor categories overflow', () => {
        const { ref } = renderComponent();
        const nameElement: HTMLElement = screen.getByText(defaultProps.item.name);
        const categoriesElement: HTMLElement = screen.getByText('Category 1, Category 2');

        Object.defineProperty(nameElement, 'scrollWidth', { value: 100 });
        Object.defineProperty(nameElement, 'clientWidth', { value: 100 });
        Object.defineProperty(categoriesElement, 'scrollWidth', { value: 100 });
        Object.defineProperty(categoriesElement, 'clientWidth', { value: 100 });

        const tooltipContent = ref.current?.getTooltipContent();

        expect(tooltipContent).toBeNull();
    });

    it('should return tooltip content when name overflows', () => {
        const testName: string = 'This is a very long program name that will definitely overflow';
        const testItem: ProgramSuggestion = {
            ...defaultProps.item,
            name: testName,
        };
        const { ref } = renderComponent({ item: testItem });

        const nameElement: HTMLElement = screen.getByText(testName);
        const categoriesElement: HTMLElement = screen.getByText('Category 1, Category 2');

        Object.defineProperty(nameElement, 'scrollWidth', { value: 200 });
        Object.defineProperty(nameElement, 'clientWidth', { value: 100 });
        Object.defineProperty(categoriesElement, 'scrollWidth', { value: 100 });
        Object.defineProperty(categoriesElement, 'clientWidth', { value: 100 });

        const tooltipContent = ref.current?.getTooltipContent() as React.ReactElement | null;

        expect(tooltipContent).not.toBeNull();
        expect(React.isValidElement(tooltipContent)).toBe(true);
        // @ts-ignore
        expect(tooltipContent?.props.className).toBe('program-suggestion-item-tooltip');
    });

    it('should return tooltip content when categories overflow', () => {
        const testCategories: string[] = [
            'Very Long Category Name 1',
            'Very Long Category Name 2',
            'Very Long Category Name 3',
        ];
        const testItem: ProgramSuggestion = {
            ...defaultProps.item,
            categories: testCategories,
        };
        const { ref } = renderComponent({ item: testItem });

        const nameElement: HTMLElement = screen.getByText(defaultProps.item.name);
        const categoriesElement: HTMLElement = screen.getByText(
            'Very Long Category Name 1, Very Long Category Name 2, Very Long Category Name 3',
        );

        Object.defineProperty(nameElement, 'scrollWidth', { value: 100 });
        Object.defineProperty(nameElement, 'clientWidth', { value: 100 });
        Object.defineProperty(categoriesElement, 'scrollWidth', { value: 300 });
        Object.defineProperty(categoriesElement, 'clientWidth', { value: 150 });

        const tooltipContent = ref.current?.getTooltipContent() as React.ReactElement | null;

        expect(tooltipContent).not.toBeNull();
        expect(React.isValidElement(tooltipContent)).toBe(true);
    });

    it('should include correct content in tooltip', () => {
        const testName: string = 'Overflow Program';
        const testCategories: string[] = ['Test Category'];
        const testItem: ProgramSuggestion = {
            ...defaultProps.item,
            name: testName,
            categories: testCategories,
        };
        const { ref } = renderComponent({ item: testItem });

        const nameElement: HTMLElement = screen.getByText(testName);
        Object.defineProperty(nameElement, 'scrollWidth', { value: 200 });
        Object.defineProperty(nameElement, 'clientWidth', { value: 100 });

        const tooltipContent = ref.current?.getTooltipContent() as React.ReactElement | null;

        // @ts-ignore
        const nameDiv = tooltipContent?.props.children[0];
        // @ts-ignore
        const categoriesDiv = tooltipContent?.props.children[1];

        expect(nameDiv.props.children).toBe(testName);
        expect(categoriesDiv.props.children).toBe('Test Category');
        expect(nameDiv.props.className).toBe('program-suggestion-item-tooltip__name');
        expect(categoriesDiv.props.className).toBe('program-suggestion-item-tooltip__categories');
    });

    it('should update tooltip when item changes', () => {
        const initialItem: ProgramSuggestion = {
            ...defaultProps.item,
            name: 'Initial Name',
            categories: ['Initial Category'],
        };
        const { ref, rerender } = renderComponent({ item: initialItem });

        const updatedItem: ProgramSuggestion = {
            ...defaultProps.item,
            name: 'Updated Name',
            categories: ['Updated Category'],
        };

        rerender(<ProgramSuggestionItem item={updatedItem} ref={ref} />);

        const nameElement: HTMLElement = screen.getByText('Updated Name');
        Object.defineProperty(nameElement, 'scrollWidth', { value: 200 });
        Object.defineProperty(nameElement, 'clientWidth', { value: 100 });

        const tooltipContent = ref.current?.getTooltipContent() as React.ReactElement | null;

        // @ts-ignore
        const nameDiv = tooltipContent?.props.children[0];
        // @ts-ignore
        const categoriesDiv = tooltipContent?.props.children[1];

        expect(nameDiv.props.children).toBe('Updated Name');
        expect(categoriesDiv.props.children).toBe('Updated Category');
    });
});
