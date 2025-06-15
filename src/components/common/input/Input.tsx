import "./input.scss"
import MagnifyingGlassIcon from "../../../assets/icons/la_search.svg";
import React, {useRef, useState} from "react";
import {Select} from "../select/Select";
import RemoveQueryIcon from "../../../assets/icons/remove-query.svg";

export type InputProps = {
    onChange: (query: string) => void;
    autocompleteValues: string[];
};

export const Input = ({onChange, autocompleteValues}: InputProps) => {
    const [value, setValue] = useState<string>('');
    const selectContainerRef = useRef<HTMLDivElement>(null);
    const isAutocompleteOpen = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleOnChange = (value: string) => {
        setValue(value);
        onChange(value);

        if(selectContainerRef.current && !isAutocompleteOpen.current && value){
            isAutocompleteOpen.current = true;
            selectContainerRef.current.click();
        }

        if(selectContainerRef.current && isAutocompleteOpen.current && !value){
            isAutocompleteOpen.current = false;
            selectContainerRef.current.click();
        }
    };

    const handleChooseAutocompleteValue = (value: string) => {
        isAutocompleteOpen.current = false;
        if(selectContainerRef.current){
            selectContainerRef.current.click();
        }
        setValue(value);
        onChange(value);
    };

    const handleSearchIconClick = () => {
        if(inputRef.current){
            inputRef.current.focus();
        }
    };

    const handleRemoveQueryIconClick = () => {
        setValue('');
        handleOnChange('');
    };

    return (
        <div className="input">
            <img onClick={handleSearchIconClick} src={MagnifyingGlassIcon} alt="input-icon" className='input-icon input-search-icon'/>
            <img onClick={handleRemoveQueryIconClick} src={RemoveQueryIcon} alt="remove-query-icon" className='input-icon input-remove-query-icon'/>
            <input ref={inputRef} value={value} onChange={e => handleOnChange(e.currentTarget.value)} placeholder={"Пошук за ім'ям"} type="text"/>
            <Select isAutocomplete={true} className='autocomplete' selectContainerRef={selectContainerRef} onValueChange={handleChooseAutocompleteValue}>
                {autocompleteValues.map((av, index) => (
                    <Select.Option key={index} value={av} name={av}></Select.Option>
                ))}
            </Select>
        </div>);
}
