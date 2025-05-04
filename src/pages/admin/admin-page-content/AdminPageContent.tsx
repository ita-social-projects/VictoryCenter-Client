import React, { useState, useEffect } from "react";
import { useAdminContext } from "../../../context/admin-context-provider/AdminContextProvider";
import { adminPageDataFetch } from "../../../services/data-fetch/admin-page-data-fetch/adminPageDataFetch";

export const AdminPageContent = () => {
  const { token } = useAdminContext();
  console.log("Here is our token", token);

  const [headerInfo, setHeaderInfo] = useState("");
  const [contentInfo, setContentInfo] = useState("");

  useEffect(() => {
    (async () => {
      const responce = await adminPageDataFetch();

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
    <div className="admin-page-content">
      <h1>{headerInfo}</h1>
      <p>{contentInfo}</p>
    </div>
  );
};
