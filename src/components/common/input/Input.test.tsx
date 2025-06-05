import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, InputProps } from './Input';

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
            <div data-testid={`select-option-${value}`} onClick={onClick}>
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
        render(<Input onChange={onChangeMock} autocompleteValues={autocompleteValues} />);
    });

    it('renders input field and icons', () => {
        expect(screen.getByPlaceholderText("Пошук за ім'ям")).toBeInTheDocument();
        expect(screen.getByAltText('input-icon')).toBeInTheDocument();
        expect(screen.getByAltText('remove-query-icon')).toBeInTheDocument();
    });

    it('updates input value and calls onChange when typing', () => {
        const input = screen.getByPlaceholderText("Пошук за ім'ям");
        fireEvent.change(input, { target: { value: 'A' } });
        expect(input).toHaveValue('A');
        expect(onChangeMock).toHaveBeenCalledWith('A');
    });

    it('clears the input and triggers onChange when remove icon is clicked', () => {
        const input = screen.getByPlaceholderText("Пошук за ім'ям");
        fireEvent.change(input, { target: { value: 'Bob' } });
        fireEvent.click(screen.getByAltText('remove-query-icon'));
        expect(input).toHaveValue('');
        expect(onChangeMock).toHaveBeenCalledWith('');
    });

    it('focuses the input when search icon is clicked', () => {
        const input = screen.getByPlaceholderText("Пошук за ім'ям") as HTMLInputElement;
        jest.spyOn(input, 'focus');
        fireEvent.click(screen.getByAltText('input-icon'));
        expect(input.focus).toHaveBeenCalled();
    });
});
