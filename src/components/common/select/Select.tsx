import React, {RefObject, useState} from "react";
import classNames from "classnames";
import "./select.scss"
import ArrowDown from "../../../assets/icons/chevron-down.svg"
import ArrowUp from "../../../assets/icons/chevron-up.svg";
import { TEAM_STATUS_DEFAULT } from "../../../const/admin/team-page";

export type SelectProps<TValue> = {
    children: React.ReactNode;
    onValueChange: (value: TValue) => void;
    selectContainerRef?: RefObject<HTMLDivElement | null>;
    className?: string;
    isAutocomplete?: boolean;
};

export const Select = <TValue, >({
                                     children,
                                     onValueChange,
                                     selectContainerRef,
                                     className,
                                     isAutocomplete = false
                                 }: SelectProps<TValue>) => {
    const options = React.Children.toArray(children).filter(x => React.isValidElement(x) && x.type === Select.Option);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<TValue | null>(null);
    const handleOpenSelect = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (value: TValue) => {
        setSelectedValue(value);
        onValueChange(value);
    };

    const isSelectedValuePresent = !!selectedValue;

    return (<div role={"toolbar"} ref={selectContainerRef}
                 onClick={handleOpenSelect}
                 className={`${className ?? ''} select ${isOpen ? 'select-opened' : 'select-closed'}`}
                 tabIndex={0}
                 onKeyDown={(e) => {
                     if (e.key === 'Enter' || e.key === ' ') {
                         handleOpenSelect();
                     }
                 }}>
        <span
            className={classNames({
                'empty': !isSelectedValuePresent,
                'not-empty': isSelectedValuePresent})}
                >
                {isSelectedValuePresent ? selectedValue.toString() : TEAM_STATUS_DEFAULT}
        </span>
        <img src={isOpen ? ArrowUp : ArrowDown} alt="arrow-down"/>
        <div className={`select-options ${isOpen ? 'select-options-visible' : ''}`}>
            {options.map((opt, index) => {
                if (!React.isValidElement(opt)) return <></>;
                const {name, value} = opt.props as { children: React.ReactNode, value: TValue, name: string };
                return (<button key={`${name}-${index}`}
                             className={(!isAutocomplete && selectedValue === value) ? 'select-options-selected' : ''}
                             onClick={() => handleSelect(value)}>
                    <span>{name}</span>
                </button>)
            })}
        </div>
    </div>);
}

Select.Option = <TValue, >({children, value, name}: {
    children?: React.ReactNode,
    value: TValue,
    name: string
}) => <>{children}</>

