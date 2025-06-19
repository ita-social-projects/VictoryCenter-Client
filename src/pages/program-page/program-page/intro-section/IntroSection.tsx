import React from 'react';
import './IntroSection.scss'

export const IntroSection: React.FC = () => {
    
    return (
        <div className="intro-section">
            <h1>Ми створюємо <span>простори,</span> де можливе <span>зцілення</span></h1>
            <div className="additional-info">
                <p>У Victory Center ми віримо: зцілення починається не зі слів, а з тиші, <br/>присутності й дотику до живого. Там, де можна видихнути. Там, де тебе бачать.</p>
                <p>Наші програми — це про повернення до себе і віднайдення внутрішньої сили. Через коня, через тіло, через простір, у якому можна знову довіряти — собі й життю.</p>
            </div>
        </div>
    );
};
