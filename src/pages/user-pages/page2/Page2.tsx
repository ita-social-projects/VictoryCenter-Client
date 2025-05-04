import React, { useState, useEffect } from 'react';
import './page2.scss';

import { page2DataFetch } from '../../../utils/data-fetch/user-pages-data-fetch/page-2-data-fetch/page2DataFetch';

export const Page2 = () => {
    const [headerInfo, setHeaderInfo] = useState('');
    const [contentInfo, setContentInfo] = useState('');


    useEffect(() => {
      (async () => {
        const responce = await page2DataFetch();

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
      <div className="page2-container">
        <h1>{headerInfo}</h1>
        <p>{contentInfo}</p>
      </div>
    );
};
