import React, { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../const/routers/routes";
import "./Footer.scss";
import "../../const/footer/footer"
import arrowIcon from "../../assets/images/footer/arrow-up-right.svg";
import { ABOUT_US, ABOUT_VC, ARCHIVE, EVENTS, FINANCIALLY, FOR_CHILDREN, FOR_VETERAN, HISTORY_OF_CREATION, HOW_TO_SUPPORT, NON_FINANCIALLY, PARTNERS, PRESS_ABOUT_US, PROGRAMS, REPORTING, REPORTS, REVIEWS, SUCCES_STORIES, TEAM, VICTORY_STARTS_WITH_YOU, WHAT_IS_HIPPOTHERAPY } from "../../const/footer/footer";

const {
  userPageRoutes: { page1Route, page2Route },
} = routes;

export const Footer = () => {
  const [email, setEmail] = useState("");

  const handleClick = () => {
    setEmail("");
  };

   const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  return (
    <div className="content">
      <div className="main_block">
        <div className="email_field">
          <span className="title">Будьте в курсі новин та можливостей</span>
          <div className="input_block">
            <input
              type="email"
              placeholder="Вкажіть ваш Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              onClick={handleClick}
              className="subscribe-btn"
              aria-label="Підписатися"
            >
              <img src={arrowIcon} alt="Підписатися" />
            </button>
          </div>
        </div>

        <div className="about_us">
          <span className="title">{ABOUT_US}</span>
          <Link to={page1Route}>{ABOUT_VC}</Link>
          <Link to={page2Route}>{TEAM}</Link>
          <Link to={page2Route}>{HISTORY_OF_CREATION}</Link>
          <Link to={page2Route}>{PARTNERS}</Link>
          <Link to={page2Route}>{EVENTS}</Link>
          <Link to={page2Route}>{PRESS_ABOUT_US}</Link>
        </div>

        <div className="programs">
          <span className="title">{PROGRAMS}</span>
          <Link to={page1Route}>{WHAT_IS_HIPPOTHERAPY}</Link>
          <Link to={page2Route}>{FOR_VETERAN}</Link>
          <Link to={page2Route}>{FOR_CHILDREN}</Link>
          <Link to={page2Route}>{ARCHIVE}</Link>
          <Link to={page2Route}>{REVIEWS}</Link>
          <Link to={page2Route}>{SUCCES_STORIES}</Link>
        </div>

        <div className="reports_title_block">
          <div className="reports">
            <span className="title">{REPORTING}</span>
            <Link to={page1Route}>{REPORTS}</Link>
          </div>
          <div className="help">
            <span className="title">{HOW_TO_SUPPORT}</span>
            <Link to={page1Route}>{FINANCIALLY}</Link>
            <Link to={page1Route}>{NON_FINANCIALLY}</Link>
          </div>
        </div>
      </div>

      <div className="contact_block">
        <div className="main_contacts">
          <p className="contact-item" onClick={() => copyToClipboard('+380 50 334 4448')}>
            +380 50 334 4448
          </p>
          <p className="contact-item" onClick={() => copyToClipboard('victorycenter@gmail.com')}>
            victorycenter@gmail.com
          </p>
        </div>
        <div className="social_media"></div>
          <p className="contact-item" onClick={() => copyToClipboard('some_inst')}>
           Instagram
          </p>
          <p className="contact-item" onClick={() => copyToClipboard('some_facebook')}>
           Facebook
          </p>
          <p className="contact-item" onClick={() => copyToClipboard('some_telegram')}>
           Telegram
          </p>
      </div>
      <div className="scrolling-text-wrapper">
      <p className="scrolling-text">
        <span>{VICTORY_STARTS_WITH_YOU}</span>
        <span>{VICTORY_STARTS_WITH_YOU}</span>
      </p>
    </div>
    </div>
  );
};
