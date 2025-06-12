import React, { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../const/routers/routes";
import "./Footer.scss";
import arrowIcon from "../../assets/images/footer/arrow-up-right.svg";
import phoneIcon from "../../assets/images/footer/phone.svg";
import mailIcon from "../../assets/images/footer/mail.svg";
import {
  ABOUT_US,
  HIPPOTHERAPY,
  MENU,
  REPORTING,
  STORE,
  HOW_TO_SUPPORT,
  STORIES_OF_VICTORIES,
  OUR_HISTORY,
  OUR_TEAM,
  PARTNERS,
  EVENTS_AND_NEWS,
  PROGRAMS,
  PROGRAMS_SESSIONS,
  VICTORY_STARTS_WITH_YOU,
  STAY_UP_TO_DATE_WUTH_THE_NEWS,
  ENTER_YOUR_EMAIL,
  SIGN_UP,
  WHAT_IS_HIPPOTHERAPY,
} from "../../const/footer/footer";

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
          <span className="title">{STAY_UP_TO_DATE_WUTH_THE_NEWS}</span>
          <div className="input_block">
            <input
              type="email"
              placeholder={ENTER_YOUR_EMAIL}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              onClick={handleClick}
              className="subscribe-btn"
              aria-label={SIGN_UP}
            >
              <img src={arrowIcon} alt={SIGN_UP} />
            </button>
          </div>
        </div>

        <div className="programs">
          <span className="title">{MENU}</span>
          <Link to={page1Route}>{REPORTING}</Link>
          <Link to={page2Route}>{STORE}</Link>
          <Link to={page2Route}>{HOW_TO_SUPPORT}</Link>
          <Link to={page2Route}>{STORIES_OF_VICTORIES}</Link>
        </div>

        <div className="about_us">
          <span className="title">{ABOUT_US}</span>
          <Link to={page1Route}>{ABOUT_US}</Link>
          <Link to={page2Route}>{OUR_HISTORY}</Link>
          <Link to={page2Route}>{OUR_TEAM}</Link>
          <Link to={page2Route}>{PARTNERS}</Link>
          <Link to={page2Route}>{EVENTS_AND_NEWS}</Link>
        </div>

          <div className="about_us">
            <span className="title">{HIPPOTHERAPY}</span>
            <Link to={page1Route}>{WHAT_IS_HIPPOTHERAPY}</Link>
            <Link to={page1Route}>{PROGRAMS}</Link>
            <Link to={page1Route}>{PROGRAMS_SESSIONS}</Link>
          </div>
      </div>

      <div className="contact_block">
        <div className="main_contacts">
           <button
            className="contact-item"
            onClick={() => copyToClipboard("victorycenter@gmail.com")}
          >
            <img src={mailIcon} alt="mail" />
            victorycenter@gmail.com
          </button>
          <button
            className="contact-item"
            onClick={() => copyToClipboard("+380 50 334 4448")}
          >
            <img src={phoneIcon} alt="phone" />
            +380 50 334 4448
          </button>
        </div>
        <div className="social_media">
          <button
            className="contact-item"
            onClick={() => copyToClipboard("some_facebook")}
          >
            Facebook
          </button>
          <button
            className="contact-item"
            onClick={() => copyToClipboard("some_telegram")}
          >
            Telegram
          </button>
          <button
            className="contact-item"
            onClick={() => copyToClipboard("some_inst")}
          >
            Instagram
          </button>
        </div>
      </div>
      <div className="scrolling-text-wrapper">
        <p className="scrolling-text">
          <span>{VICTORY_STARTS_WITH_YOU} </span>
          <span> {VICTORY_STARTS_WITH_YOU}</span>
        </p>
      </div>
    </div>
  );
};
