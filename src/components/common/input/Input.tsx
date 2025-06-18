import "./input.scss"
import React, { useRef, useState, useCallback } from "react";
import { Select } from "../select/Select";

export type InputProps = {
    onChange: (query: string) => void;
    autocompleteValues: string[];
};

export const Input = ({ onChange, autocompleteValues }: InputProps) => {
    const [value, setValue] = useState<string>('');
    const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
    const selectContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleOnChange = useCallback((newValue: string) => {
        setValue(newValue);
        onChange(newValue);
        if (newValue && !isAutocompleteOpen) {
            setIsAutocompleteOpen(true);
            selectContainerRef.current?.click();
        } else if (!newValue && isAutocompleteOpen) {
            setIsAutocompleteOpen(false);
            selectContainerRef.current?.click();
        }
    }, [onChange, isAutocompleteOpen]);

    const handleChooseAutocompleteValue = useCallback((selectedValue: string) => {
        setIsAutocompleteOpen(false);
        selectContainerRef.current?.click();
        setValue(selectedValue);
        onChange(selectedValue);
    }, [onChange]);

    const handleSearchIconClick = useCallback(() => {
        inputRef.current?.focus();
    }, []);

    const handleRemoveQueryIconClick = useCallback(() => {
        setValue('');
        handleOnChange('');
    }, [handleOnChange]);

    return (
        <div className="input" data-testid="input-root">
            <button
                onClick={handleSearchIconClick}
                className='input-icon input-search-icon'
                data-testid="search-icon"
            />
            <button
                onClick={handleRemoveQueryIconClick}
                className='input-icon input-remove-query-icon'
                data-testid="remove-query-icon"
            />
            <input
                ref={inputRef}
                value={value}
                onChange={e => handleOnChange(e.currentTarget.value)}
                placeholder={"Пошук за ім'ям"}
                type="text"
                data-testid="input-field"
            />
            <Select
                isAutocomplete={true}
                className='autocomplete'
                selectContainerRef={selectContainerRef}
                onValueChange={handleChooseAutocompleteValue}
                data-testid="autocomplete-select"
            >
                {autocompleteValues.map((av) => (
                    <Select.Option key={av} value={av} name={av} data-testid={`select-option-${av}`}></Select.Option>
                ))}
            </Select>
        </div>
    );
}
