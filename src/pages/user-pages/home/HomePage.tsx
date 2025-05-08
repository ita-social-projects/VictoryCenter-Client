import React, { useState, useEffect } from "react";
import './home-page.scss';

import { homePageDataFetch } from "../../../services/data-fetch/user-pages-data-fetch/home-page-data-fetch/homePageDataFetch";

export const HomePage = () => {
  const [headerInfo, setHeaderInfo] = useState("");
  const [contentInfo, setContentInfo] = useState("");

  useEffect(() => {
    (async () => {
      const responce = await homePageDataFetch();

      const { header, content } = responce;

      // DEV NOTE: in React 18 and higher there is a term "Automatic Batching"
      // https://react.dev/blog/2022/03/08/react-18-upgrade-guide#automatic-batching
      // that means if you are calling setState one after another it will set data in ONE render cycle
      // please follow the pattern

      setHeaderInfo(header);
      setContentInfo(content);
    })();
  }, []);

  return (
    <div className="home-page-container">
      <h1 className='header'>{headerInfo}</h1>
      <p className='content'>{contentInfo}</p>
    </div>
  );
};
