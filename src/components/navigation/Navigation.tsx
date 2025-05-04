import React from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../const/routes';

// DEV NOTE: this is test component creqated to simulate navigation
// modify or delete it if necessary

const { adminRoute, userPageRoutes: { page1Route, page2Route } } = routes;

export const Navigation = () => {
  return(
    <nav>
      <Link to="/">Home</Link> | <Link to={adminRoute}>Admin page</Link> | <Link to={page1Route}>Page 1</Link> | <Link to={page2Route}>Page 2</Link>
    </nav>
  )
};
