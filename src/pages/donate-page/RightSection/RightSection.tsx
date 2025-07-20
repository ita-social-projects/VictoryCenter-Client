import React from 'react';
import './RightSection.scss';
import { IN_UKRAINE_LABEL, NOT_IN_UKRAINE_LABEL } from '../../../const/donate-page/donate-page';
import { UkrainePaymentDetails } from './UkrainePaymentDetails/UkrainePaymentDetails';
import { AbroadPaymentDetails } from './AbroadPaymentDetails/AbroadPaymentDetails';

export const RightSection = () => {
    const [isAbroad, setIsAbroad] = React.useState(false);

    return (
        <div className="rightSection">
            <div className="locationToggleContainer">
                <label className="switch">
                    <input type="checkbox" checked={isAbroad} onChange={() => setIsAbroad(!isAbroad)} />
                    <span className="slider round"></span>
                </label>
                <span className="toggleLabel">{isAbroad ? NOT_IN_UKRAINE_LABEL : IN_UKRAINE_LABEL}</span>
            </div>
            <div className="donatePaymentDetails">
                {isAbroad ? <AbroadPaymentDetails /> : <UkrainePaymentDetails />}
            </div>
        </div>
    );
};
