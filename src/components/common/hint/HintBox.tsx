import React from 'react';
import InfoIcon from '../../../assets/icons/info.svg';
import './hint-box.scss';

export interface HintBoxProps {
    title: string;
    text?: string;
}

export const HintBox = ({ title, text }: HintBoxProps) => {
    return (
        <div className="hint-box">
            <div className="hint-box-title">
                <img src={InfoIcon} alt="hint-icon" />
                <span>{title}</span>
            </div>
            {text && <span>{text}</span>}
        </div>
    );
};
