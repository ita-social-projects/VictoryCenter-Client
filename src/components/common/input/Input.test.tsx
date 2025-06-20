import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

jest.mock("../../../assets/icons/la_search.svg", () => "search-icon.svg");
jest.mock("../../../assets/icons/remove-query.svg", () => "remove-icon.svg");

jest.mock('../select/Select', () => {
    const mockReact = require('react');
    return {
        Select: ({ children, selectContainerRef, onValueChange, isAutocomplete, className }: any) => {
            mockReact.useEffect(() => {
                if (selectContainerRef) {
                    selectContainerRef.current = {
                        click: jest.fn(),
                    };
                }
            }, []);
            return (
                <div data-testid="select" className={className}>
                    {mockReact.Children.map(children, (child: any) =>
                        mockReact.cloneElement(child, { onClick: () => onValueChange(child.props.value) })
                    )}
                </div>
            );
        },
        SelectOption: ({ value, name, onClick }: any) => (
            <div data-testid={`select-option-${value}`} onClick={onClick} onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick();
                }
            }}>
                {name}
            </div>
        ),
    };
});

jest.mocked(require('../select/Select').Select).Option = ({ value, name }: any) => (
    <div data-testid={`select-option-${value}`}>{name}</div>
);

describe('Input component', () => {
    const autocompleteValues = ['Alice', 'Bob', 'Charlie'];
    let onChangeMock: jest.Mock;

    beforeEach(() => {
        onChangeMock = jest.fn();
    });

    it('renders input field and icons', () => {
        render(<Input onChange={onChangeMock} autocompleteValues={autocompleteValues} />);
        expect(screen.getByTestId('input-field')).toBeInTheDocument();
        expect(screen.getByTestId('search-icon')).toBeInTheDocument();
        expect(screen.getByTestId('remove-query-icon')).toBeInTheDocument();
    });

    it('updates input value and calls onChange when typing', () => {
        render(<Input onChange={onChangeMock} autocompleteValues={autocompleteValues} />);

        const input = screen.getByTestId('input-field');
        fireEvent.change(input, { target: { value: 'A' } });
        expect(input).toHaveValue('A');
        expect(onChangeMock).toHaveBeenCalledWith('A');
    });

    it('clears the input and triggers onChange when remove icon is clicked', () => {
        render(<Input onChange={onChangeMock} autocompleteValues={autocompleteValues} />);

        const input = screen.getByTestId('input-field');
        fireEvent.change(input, { target: { value: 'Bob' } });
        fireEvent.click(screen.getByTestId('remove-query-icon'));
        expect(input).toHaveValue('');
        expect(onChangeMock).toHaveBeenCalledWith('');
    });

    it('focuses the input when search icon is clicked', () => {
        render(<Input onChange={onChangeMock} autocompleteValues={autocompleteValues} />);

        const input = screen.getByTestId('input-field') as HTMLInputElement;
        jest.spyOn(input, 'focus');
        fireEvent.click(screen.getByTestId('search-icon'));
        expect(input.focus).toHaveBeenCalled();
    });

    it('does not open autocomplete dropdown if input is empty', () => {
        render(<Input onChange={onChangeMock} autocompleteValues={autocompleteValues} />);
        const input = screen.getByPlaceholderText("Пошук за ім'ям");
        const select = screen.getByTestId('select');
        const selectContainer = select;
        const clickSpy = jest.spyOn(selectContainer, 'click');
        // Try to open dropdown with empty input
        fireEvent.change(input, { target: { value: '' } });
        expect(clickSpy).not.toHaveBeenCalled();
    });

    it('renders no autocomplete options if autocompleteValues is empty', () => {
        render(<Input onChange={onChangeMock} autocompleteValues={[]} />);
        expect(screen.queryByTestId('select-option-')).not.toBeInTheDocument();
    });

    it('calls onChange with empty string when remove icon is clicked after input is already empty', () => {
        render(<Input onChange={onChangeMock} autocompleteValues={autocompleteValues} />);
        const input = screen.getByTestId('input-field');
        expect(input).toHaveValue('');
        fireEvent.click(screen.getByTestId('remove-query-icon'));
        expect(onChangeMock).toHaveBeenCalledWith('');
    });

    it('does not crash if autocompleteValues contains duplicate values', () => {
        const valuesWithDuplicates = ['Alice', 'Alice', 'Bob'];
        render(<Input onChange={onChangeMock} autocompleteValues={valuesWithDuplicates} />);
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(1);
    });
});

