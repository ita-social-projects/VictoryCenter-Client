import React from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../const/routers/routes';

// DEV NOTE: this is test component creqated to simulate navigation
// modify or delete it if necessary

const { adminRoute, userPageRoutes: { TeamPageRoute, page2Route } } = routes;

export const Navigation = () => {
  return(
    <nav>
      <Link to="/">Home</Link> | <Link to={adminRoute}>Admin page</Link> | <Link to={TeamPageRoute}>Team Page</Link> | <Link to={page2Route}>Page 2</Link>
    </nav>
  )
};
