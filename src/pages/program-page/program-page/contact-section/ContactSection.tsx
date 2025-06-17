import React from 'react';
import background from "../../../../assets/program_page_images/videos/background.mp4";
import "./ContactSection.scss"
export const ContactSection: React.FC = () => {
    return (
        <div className="contact-us-block">
            <video autoPlay muted loop playsInline>
                <source src={background} type="video/mp4" />
            </video>
            <div className="contact-us-info">
                <h2 className="contact-title">Не впевнені, яка програма підійде саме вам?</h2>
                <div className="contact-button">
                    <h4>Напишіть нам — ми разом підберемо те, що найкраще відповідає вашим потребам або потребам вашої дитини.</h4>
                    <button>Звʼязатись</button>
                </div>
            </div>
        </div>
    )
}
