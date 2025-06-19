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
  STAY_UP_TO_DATE_WITH_THE_NEWS,
  ENTER_YOUR_EMAIL,
  SIGN_UP,
  WHAT_IS_HIPPOTHERAPY,
  EMAIL,
  PHONE,
  FACEBOOK,
  INSTAGRAM,
  TELEGRAM,
} from "../../const/footer/footer";

const {
  userPageRoutes: { TeamPageRoute, page2Route },
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
    <div className="footer-content">
      <div className="main-block">
        <div className="email_field">
          <span className="title">{STAY_UP_TO_DATE_WITH_THE_NEWS}</span>
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

        <div className="menu">
          <span className="title">{MENU}</span>
          <Link to={TeamPageRoute}>{REPORTING}</Link>
          <Link to={page2Route}>{STORE}</Link>
          <Link to={page2Route}>{HOW_TO_SUPPORT}</Link>
          <Link to={page2Route}>{STORIES_OF_VICTORIES}</Link>
        </div>

        <div className="about_us">
          <span className="title">{ABOUT_US}</span>
          <Link to={TeamPageRoute}>{ABOUT_US}</Link>
          <Link to={page2Route}>{OUR_HISTORY}</Link>
          <Link to={page2Route}>{OUR_TEAM}</Link>
          <Link to={page2Route}>{PARTNERS}</Link>
          <Link to={page2Route}>{EVENTS_AND_NEWS}</Link>
        </div>

        <div className="hippotherapy">
          <span className="title">{HIPPOTHERAPY}</span>
          <Link to={TeamPageRoute}>{WHAT_IS_HIPPOTHERAPY}</Link>
          <Link to={TeamPageRoute}>{PROGRAMS}</Link>
          <Link to={TeamPageRoute}>{PROGRAMS_SESSIONS}</Link>
        </div>
      </div>

      <div className="contact-block">
        <div className="main_contacts">
          <button
            className="contact-item"
            onClick={() => copyToClipboard(EMAIL)}
          >
            <img src={mailIcon} alt="mail" /> {EMAIL}
          </button>
          <button
            className="contact-item"
            onClick={() => copyToClipboard(PHONE)}
          >
            <img src={phoneIcon} alt="phone" /> {PHONE}
          </button>
        </div>
        <div className="social_media">
          <button
            className="contact-item"
            onClick={() => copyToClipboard(FACEBOOK)}
          >
            Facebook
          </button>
          <button
            className="contact-item"
            onClick={() => copyToClipboard(TELEGRAM)}
          >
            Telegram
          </button>
          <button
            className="contact-item"
            onClick={() => copyToClipboard(INSTAGRAM)}
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
