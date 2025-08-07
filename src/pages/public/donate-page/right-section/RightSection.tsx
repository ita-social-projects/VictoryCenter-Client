import { useState } from 'react';
import './RightSection.scss';
import { UkrainePaymentDetails } from './ukraine-payment-details/UkrainePaymentDetails';
import { AbroadPaymentDetails } from './abroad-payment-details/AbroadPaymentDetails';
import { AlternativeSupportWays } from './alternative-support-ways/AlternativeSupportWays';
import { IN_UKRAINE_LABEL, NOT_IN_UKRAINE_LABEL } from '../../../../const/public/donate-page';

export const RightSection = () => {
    const [isAbroad, setIsAbroad] = useState(false);

    const handleOnChange = () => {
        setIsAbroad(!isAbroad);
    };

    return (
        <div className="rightSection">
            <div className="locationToggleContainer">
                <label className="switch">
                    <input type="checkbox" checked={isAbroad} onChange={handleOnChange} />
                    <span className="slider round"></span>
                </label>
                <span className="toggleLabel">{isAbroad ? NOT_IN_UKRAINE_LABEL : IN_UKRAINE_LABEL}</span>
            </div>
            <div className="donatePaymentDetails">
                {isAbroad ? <AbroadPaymentDetails /> : <UkrainePaymentDetails />}
                <AlternativeSupportWays />
            </div>
        </div>
    );
};
