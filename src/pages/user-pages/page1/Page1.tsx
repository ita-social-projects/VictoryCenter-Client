import React, { useState, useEffect } from 'react';
import './page1.scss';

import { page1DataFetch } from '../../../utils/data-fetch/user-pages-data-fetch/page-1-data-fetch/page1DataFetch';

export const Page1 = () => {
    const [headerInfo, setHeaderInfo] = useState('');
    const [contentInfo, setContentInfo] = useState('');

    useEffect(() => {
      (async () => {
        const responce = await page1DataFetch();

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
      <div className="page1-container">
        <h1>{headerInfo}</h1>
        <p>{contentInfo}</p>
      </div>
    );
};
