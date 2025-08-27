import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MultiSelectInput, MultiSelectInputProps } from './MultiSelectInput';

jest.mock('../../../assets/icons/chevron-checked.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="chevron-checked-icon" />,
}));

jest.mock('../../../assets/icons/chevron-unchecked.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="chevron-unchecked-icon" />,
}));

jest.mock('../../../assets/icons/chevron-down.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="chevron-down-icon" />,
}));

jest.mock('../../../assets/icons/chevron-up.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="chevron-up-icon" />,
}));

interface TestOption {
    id: number;
    name: string;
}

const mockOptions: TestOption[] = [
    { id: 1, name: 'Option 1' },
    { id: 2, name: 'Option 2' },
    { id: 3, name: 'Option 3' },
    { id: 4, name: 'Option 4' },
];

const defaultProps: MultiSelectInputProps<TestOption> = {
    id: 'test-id',
    options: mockOptions,
    getOptionId: (option: TestOption) => option.id,
    getOptionName: (option: TestOption) => option.name,
};

describe('Multiselect Component', () => {
    const mockOnChange = jest.fn();
    const mockOnBlur = jest.fn();

    // Render helpers
    const renderMultiSelectInput = (overrideProps: Partial<MultiSelectInputProps<TestOption>> = {}) =>
        render(<MultiSelectInput {...defaultProps} {...overrideProps} />);

    const renderMultiSelectWithOutsideElement = (overrideProps: Partial<MultiSelectInputProps<TestOption>> = {}) =>
        render(
            <div>
                <MultiSelectInput {...defaultProps} {...overrideProps} />
                <div data-testid="outside-element">Outside</div>
            </div>,
        );

    // Element getters - using more generic approach
    const getPlaceholderButton = () =>
        screen.getByRole('button', { expanded: false }) || screen.getByRole('button', { expanded: true });
    const getPlaceholderByText = (text: string) => screen.getByText(text);
    const getOptionByName = (name: string) => screen.getByRole('option', { name: new RegExp(name, 'i') });
    const getOptionsContainer = () => screen.queryByRole('listbox');

    // Icon getters
    const getExpandIcon = () => screen.getByTestId('chevron-down-icon');
    const getCollapseIcon = () => screen.getByTestId('chevron-up-icon');
    const getUnselectedOptionIcons = () => screen.getAllByTestId('chevron-unchecked-icon');

    // DOM element getters with updated class names
    const getMultiselectContainer = () => document.querySelector('.multiselect');
    const getPlaceholderContainer = () => document.querySelector('.multiselect__placeholder-container');
    const getPlaceholderElement = () => document.querySelector('.multiselect__placeholder');
    const getSelectedOptionElement = () => document.querySelector('.multiselect__option--selected');
    const getOutsideElement = () => screen.getByTestId('outside-element');

    // Query helpers
    const queryOptionByName = (name: string) => screen.queryByRole('option', { name: new RegExp(name, 'i') });
    const queryOptionsContainer = () => screen.queryByRole('listbox');

    // Action helpers - more flexible approach
    const clickPlaceholder = () => fireEvent.click(getPlaceholderButton());
    const clickOptionByName = (name: string) => fireEvent.click(getOptionByName(name));
    const clickOutside = () => fireEvent.mouseDown(getOutsideElement());

    const pressKeyOnOption = (option: TestOption, key: string) => {
        const optionElement = getOptionByName(option.name);
        fireEvent.keyDown(optionElement, { key });
    };

    // State helpers
    const createPropsWithCallbacks = (overrides: Partial<MultiSelectInputProps<TestOption>> = {}) => ({
        ...defaultProps,
        onChange: mockOnChange,
        onBlur: mockOnBlur,
        ...overrides,
    });

    const createPropsWithSelectedValues = (selectedValues: TestOption[]) => ({ value: selectedValues });

    // Assertion helpers
    const expectPlaceholderTextToBe = (text: string) => {
        expect(getPlaceholderByText(text)).toBeInTheDocument();
    };

    const expectPlaceholderButtonToHaveClass = (className: string) => {
        expect(getPlaceholderContainer()).toHaveClass(className);
    };

    const expectPlaceholderElementToHaveClass = (className: string) => {
        expect(getPlaceholderElement()).toHaveClass(className);
    };

    const expectMultiselectContainerToHaveClass = (className: string) => {
        expect(getMultiselectContainer()).toHaveClass(className);
    };

    const expectDropdownToBeOpen = () => {
        expect(getOptionsContainer()).toBeInTheDocument();
        expect(getCollapseIcon()).toBeInTheDocument();
    };

    const expectDropdownToBeClosed = () => {
        expect(queryOptionsContainer()).not.toBeInTheDocument();
        expect(getExpandIcon()).toBeInTheDocument();
    };

    const expectOptionToBeVisible = (name: string) => {
        expect(getOptionByName(name)).toBeInTheDocument();
    };

    const expectOptionNotToBeVisible = (name: string) => {
        expect(queryOptionByName(name)).not.toBeInTheDocument();
    };

    const expectAllOptionsToBeVisible = () => {
        mockOptions.forEach((option) => {
            expectOptionToBeVisible(option.name);
        });
    };

    const expectNoOptionsToBeVisible = () => {
        mockOptions.forEach((option) => {
            expectOptionNotToBeVisible(option.name);
        });
    };

    const expectSelectedOptionToHaveClass = () => {
        expect(getSelectedOptionElement()).toBeInTheDocument();
    };

    const expectSelectedIconsCount = (count: number) => {
        expect(screen.getAllByTestId('chevron-checked-icon')).toHaveLength(count);
    };

    const expectUnselectedIconsCount = (count: number) => {
        expect(getUnselectedOptionIcons()).toHaveLength(count);
    };

    const expectOnChangeToBeCalledWith = (expectedValue: TestOption[]) => {
        expect(mockOnChange).toHaveBeenCalledWith(expectedValue);
    };

    const expectOnChangeNotToBeCalled = () => {
        expect(mockOnChange).not.toHaveBeenCalled();
    };

    const expectOnBlurToBeCalled = () => {
        expect(mockOnBlur).toHaveBeenCalled();
    };

    // Test setup helpers
    const openDropdown = () => {
        clickPlaceholder();
    };

    const selectOption = (option: TestOption) => {
        openDropdown();
        clickOptionByName(option.name);
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders with default placeholder', () => {
            renderMultiSelectInput();
            expectPlaceholderTextToBe('Select options...');
        });

        it('renders with custom placeholder', () => {
            renderMultiSelectInput({ placeholder: 'Choose items...' });
            expectPlaceholderTextToBe('Choose items...');
        });

        it('applies correct className to container', () => {
            renderMultiSelectInput();
            expectMultiselectContainerToHaveClass('multiselect');
        });
    });

    describe('Dropdown State', () => {
        it('shows expand icon when closed and collapse icon when open', () => {
            renderMultiSelectInput();
            expectDropdownToBeClosed();

            openDropdown();
            expectDropdownToBeOpen();
        });

        it('applies opened className when dropdown is open', () => {
            renderMultiSelectInput();
            openDropdown();
            expectPlaceholderButtonToHaveClass('multiselect__placeholder-container--opened');
        });

        it('opens dropdown when placeholder is clicked', () => {
            renderMultiSelectInput();
            openDropdown();
            expectAllOptionsToBeVisible();
        });

        it('closes dropdown when clicking outside', async () => {
            renderMultiSelectWithOutsideElement();
            openDropdown();
            expectAllOptionsToBeVisible();

            clickOutside();

            await waitFor(() => {
                expectNoOptionsToBeVisible();
            });
        });
    });

    describe('Disabled State', () => {
        it('applies disabled className when disabled prop is true', () => {
            renderMultiSelectInput({ disabled: true });
            expectPlaceholderButtonToHaveClass('multiselect__placeholder-container--disabled');
        });

        it('does not open dropdown when disabled', () => {
            renderMultiSelectInput({ disabled: true });
            clickPlaceholder();
            expectNoOptionsToBeVisible();
        });

        it('does not call onChange when disabled', () => {
            renderMultiSelectInput(createPropsWithCallbacks({ disabled: true }));
            clickPlaceholder();
            expectOnChangeNotToBeCalled();
        });
    });

    describe('Selection Display', () => {
        it('displays selected values in placeholder', () => {
            const selectedValues = [mockOptions[0], mockOptions[1]];
            renderMultiSelectInput(createPropsWithSelectedValues(selectedValues));
            expectPlaceholderTextToBe('Option 1, Option 2');
        });

        it('applies has-value className when items are selected', () => {
            const selectedValues = [mockOptions[0]];
            renderMultiSelectInput(createPropsWithSelectedValues(selectedValues));
            expectPlaceholderElementToHaveClass('multiselect__placeholder--has-value');
        });
    });

    describe('Option Selection', () => {
        it('calls onChange when option is selected', () => {
            renderMultiSelectInput(createPropsWithCallbacks());
            selectOption(mockOptions[0]);
            expectOnChangeToBeCalledWith([mockOptions[0]]);
        });

        it('calls onChange when option is deselected', () => {
            const selectedValues = [mockOptions[0], mockOptions[1]];
            renderMultiSelectInput(createPropsWithCallbacks(createPropsWithSelectedValues(selectedValues)));

            openDropdown();
            clickOptionByName('Option 1');

            expectOnChangeToBeCalledWith([mockOptions[1]]);
        });

        it('applies selected className to selected options', () => {
            const selectedValues = [mockOptions[0]];
            renderMultiSelectInput(createPropsWithSelectedValues(selectedValues));
            openDropdown();
            expectSelectedOptionToHaveClass();
        });

        it('shows correct icons for selected and unselected options', () => {
            const selectedValues = [mockOptions[0]];
            renderMultiSelectInput(createPropsWithSelectedValues(selectedValues));
            openDropdown();

            expectSelectedIconsCount(1);
            expectUnselectedIconsCount(3);
        });
    });

    describe('Keyboard Interaction', () => {
        it('handles Enter key on options', () => {
            renderMultiSelectInput(createPropsWithCallbacks());
            openDropdown();

            pressKeyOnOption(mockOptions[0], 'Enter');
            expectOnChangeToBeCalledWith([mockOptions[0]]);
        });

        it('handles Space key on options', () => {
            renderMultiSelectInput(createPropsWithCallbacks());
            openDropdown();

            pressKeyOnOption(mockOptions[0], ' ');
            expectOnChangeToBeCalledWith([mockOptions[0]]);
        });

        it('handles Escape key on options - closes dropdown and calls onBlur', () => {
            renderMultiSelectInput(createPropsWithCallbacks());
            openDropdown();
            expectDropdownToBeOpen();

            pressKeyOnOption(mockOptions[0], 'Escape');

            expectDropdownToBeClosed();
            expectOnBlurToBeCalled();
            expectOnChangeNotToBeCalled();
        });

        it('does not trigger selection on other key events', () => {
            renderMultiSelectInput(createPropsWithCallbacks());
            openDropdown();

            const nonTriggerKeys = ['Tab', 'ArrowDown', 'a'];
            nonTriggerKeys.forEach((key) => {
                pressKeyOnOption(mockOptions[0], key);
            });

            expectOnChangeNotToBeCalled();
        });
    });

    describe('Blur Event', () => {
        it('calls onBlur when dropdown closes by clicking outside', async () => {
            renderMultiSelectWithOutsideElement(createPropsWithCallbacks());
            openDropdown();
            clickOutside();

            await waitFor(() => {
                expectOnBlurToBeCalled();
            });
        });

        it('calls onBlur when Escape key is pressed', () => {
            renderMultiSelectInput(createPropsWithCallbacks());
            openDropdown();

            pressKeyOnOption(mockOptions[0], 'Escape');
            expectOnBlurToBeCalled();
        });
    });
});
