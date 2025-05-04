# Victory center

This repo contains front end part of the Victory center

Main structure of this project

my-app/
├── public/
│   └── index.html
├── src/
│   ├── assets/                             # Images, icons, fonts, etc.
│   ├── components/                         # Reusable UI components (buttons, inputs, etc.)
│   │   └── navigation
│   ├── const                               # Constans that will be used across the project
│   │   └── routes
│   ├── layouts/                            # Layout components (e.g., MainLayout, AuthLayout)
│   │   └──main-layout              
│   ├── pages/                              # Pages
│   │   ├── admin
│   │   ├── not-found
│   │   └── usesr-pages
│   │       ├── home-page
│   │       ├── page-1
│   │       └── page-2
│   ├── routes/                             # Route configuration
│   │   └── app-router
│   ├── hooks/                              # Custom React hooks
│   ├── context/                            # React context providers
│   │   └── admin-contex-provider
│   ├── services/                           # API calls, data services
│   │   └── data-fetch
│   │       ├── admin-page-data-fetch
│   │       └── user-pages-data-fetch
│   │           ├── home-page-data-fetch
│   │           ├── page-1-data-fetch
│   │           └── page-2-data-fetch
│   ├── utils/                              # Utility functions
│   │   └── mock-data
│   ├── main.jsx                            # Entry point (ReactDOM.createRoot)
│   └── index.css                           # Global styles (normalizer)
├── .gitignore
└── package.json

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**
