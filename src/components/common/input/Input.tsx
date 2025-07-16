import './input.scss';
import React, { useRef, useState, useCallback } from 'react';
import { Select } from '../select/Select';
import classNames from 'classnames';

export type InputProps = {
    onChange: (query: string) => void;
    autocompleteValues: string[];
    placeholder: string;
};

export const Input = ({ onChange, autocompleteValues, placeholder }: InputProps) => {
    const [value, setValue] = useState<string>('');
    const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
    const selectContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleOnChange = useCallback(
        (newValue: string) => {
            setValue(newValue);
            onChange(newValue);
            if (newValue && !isAutocompleteOpen) {
                setIsAutocompleteOpen(true);
                selectContainerRef.current?.click();
            } else if (!newValue && isAutocompleteOpen) {
                setIsAutocompleteOpen(false);
                selectContainerRef.current?.click();
            }
        },
        [onChange, isAutocompleteOpen],
    );

    const handleChooseAutocompleteValue = useCallback(
        (selectedValue: string) => {
            setIsAutocompleteOpen(false);
            selectContainerRef.current?.click();
            setValue(selectedValue);
            onChange(selectedValue);
        },
        [onChange],
    );

    const handleSearchIconClick = useCallback(() => {
        inputRef.current?.focus();
    }, []);

    const handleRemoveQueryIconClick = useCallback(() => {
        setValue('');
        handleOnChange('');
    }, [handleOnChange]);

    const buttonClasses = {
        'input-icon': true,
    };

    return (
        <div className="input" data-testid="input-root">
            <button
                onClick={handleSearchIconClick}
                className={classNames({ ...buttonClasses, 'input-search-icon': true })}
                data-testid="search-icon"
            />
            <button
                onClick={handleRemoveQueryIconClick}
                className={classNames({ ...buttonClasses, 'input-remove-query-icon': true })}
                data-testid="remove-query-icon"
            />
            <input
                ref={inputRef}
                value={value}
                onChange={(e) => handleOnChange(e.currentTarget.value)}
                placeholder={placeholder}
                type="text"
                data-testid="input-field"
            />
            <Select
                isAutocomplete={true}
                className="autocomplete"
                selectContainerRef={selectContainerRef}
                onValueChange={handleChooseAutocompleteValue}
                data-testid="autocomplete-select"
            >
                {autocompleteValues.map((av, index) => (
                    <Select.Option
                        key={`${av}-${index}`}
                        value={av}
                        name={av}
                        data-testid={`select-option-${av}`}
                    ></Select.Option>
                ))}
            </Select>
        </div>
    );
};
