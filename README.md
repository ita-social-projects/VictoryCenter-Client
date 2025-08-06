<a href="https://softserve.academy/"><img src="https://s.057.ua/section/newsInternalIcon/upload/images/news/icon/000/050/792/vnutr_5ce4f980ef15f.jpg" title="SoftServe IT Academy" alt="SoftServe IT Academy"></a>

# Victory Center

This repo contains front end part of the Victory center

Main structure of this project

<pre><code>
victory-center-client/
├── .github/
│   ├── ISSUE_TEMPLATE
│   ├── PULL_REQUEST_TEMPLATE
│   ├── workflows
│   │   ├── lint.build.yml
│   │   └── test.build.yml
│   ├── CODEOWNERS
│   └── pull_request_template.md
├── nginx/
│   └── nginx.conf
├── public/
│   └── index.html
├── scripts/
│   └── start-in-dev-over-https.mjs
├── src/
│   ├───assets
│   │   ├───fonts
│   │   ├───icons
│   │   ├───images
│   │   │   ├───admin
│   │   │   ├───common
│   │   │   └───public
│   │   │       ├───about-us-page
│   │   │       ├───programs-page
│   │   │       └───team-page
│   │   ├───sass
│   │   │   ├───mixins
│   │   │   └───variables
│   │   └───videos
│   │       ├───admin
│   │       ├───common
│   │       └───public
│   │           ├───programs-page
│   │           └───team-page
│   ├── components/                         # Reusable UI components (buttons, inputs, etc.)
│   │   ├── admin/                          # Admin-specific components
│   │   │   ├── admin-context-wrapper/
│   │   │   ├── admin-navigation/
│   │   │   ├── private-route/
│   │   │   └── public-route/
│   │   ├── common/                         # Shared UI components
│   │   │   ├── button/
│   │   │   ├── inline-loader/
│   │   │   ├── input/
│   │   │   ├── modal/
│   │   │   ├── scrollable-program-frame/
│   │   │   ├── page-loader/
│   │   │   └── select/
│   │   ├── footer/
│   │   └── header/                         # Header-related components
│   ├───const
│   │   ├───admin
│   │   ├───common
│   │   │   └───api-routes
│   │   └───public
│   ├── context/                            # React context providers
│   │   └── admin-context-provider
│   ├── layouts/                            # Layout components (e.g., MainLayout, AuthLayout)
│   │   ├── admin-layout/
│   │   └── main-layout/
│   ├── pages/                              # Pages
│   │   ├── about-us-page/
│   │   │   ├── company-values/
│   │   │   ├── donate-section/
│   │   │   ├── intro-section/
│   │   │   ├── main-value/
│   │   │   ├── our-mission/
│   │   │   ├── our-team-section/
│   │   │   └── support-section/
│   │   ├── admin/                          # Admin pages
│   │   │   ├── admin-page-content/         # Content components for admin pages
│   │   │   └── team/                       # Team management page
│   │   │       └── components/             # Components specific to team page
│   │   ├── login/
│   │   │   └── components/
│   │   ├── not-found/
│   │   ├── program-page/
│   │   │   └── program-page/
│   │   │       ├── contact-section/
│   │   │       ├── intro-section/
│   │   │       ├── program-section/
│   │   │       │   └── program-card/
│   │   │       └── question-section/
│   │   │           └── question-card/
│   │   └── user-pages
│   │       ├── home-page
│   │       ├── team-page
│   │       └── page-2
│   ├── routes/                             # Route configuration
│   │   └── app-router
│   ├── hooks/
│   │   └── admin/
│   ├── context/                            # React context providers
│   │   └── admin-context-provider
│   ├── services/                           # API calls, data services
│   │   ├── auth/
│   │   │   ├── auth-service/
│   │   │   ├── create-admin-client/
│   │   │   └── resolve-with-new-token/
│   │   └── data-fetch
│   │       ├── admin-page-data-fetch
|   |       │   └── team-page-data-fetch
│   │       ├── login-page-data-fetch
│   │       ├── program-page-data-fetch
│   │       └── user-pages-data-fetch
│   │           ├── home-page-data-fetch
│   │           ├── team-page-data-fetch
│   │           └── page-2-data-fetch
│   ├── types/
│   ├── utils/                              # Utility functions
│   │   ├── functions/
│   │   ├── hooks/
│   │   │   ├── use-admin-client/
│   │   │   └── use-on-mount-unsafe/
│   │   └── mock-data/
│   │       ├── admin-page/                 # Mock data for admin pages
│   │       ├── program-page/
│   │       └── user-pages/                 # Mock data for user pages
│   │           ├── home-page/
│   │           ├── team-page/
│   │           └── page-2/
│   ├── validation
│   │   └── admin-create-member-form
│   ├── index.jsx                           # Entry point (ReactDOM.createRoot)
│   ├── index.css                           # Global styles (normalizer)
│   ├── react-app-env.d.ts
│   ├── reportWebVitals.ts
│   ├── setupProxy.ts
│   └── setupTests.ts
├── .coderabbit.yaml
├── .dockerignore
├── .env.development
├── .gitignore
├── Dockerfile
├── LICENSE
├── package-lock.json
├── package.json
├── README
└── tsconfig.json
</code></pre>

<div>
[![Build Status](https://img.shields.io/travis/ita-social-projects/VictoryCenter-Client/main?style=flat-square)](https://travis-ci.org/github/ita-social-projects/VictoryCenter-Client)
[![Coverage Status](https://img.shields.io/gitlab/coverage/ita-social-projects/VictoryCenter-Client/main?style=flat-square)](https://coveralls.io)
[![Github Issues](https://img.shields.io/github/issues/ita-social-projects/VictoryCenter-Client?style=flat-square)](https://github.com/ita-social-projects/VictoryCenter-Client/issues)
[![Pending Pull-Requests](https://img.shields.io/github/issues-pr/ita-social-projects/VictoryCenter-Client?style=flat-square)](https://github.com/ita-social-projects/VictoryCenter-Client/pulls)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ita-social-projects_VictoryCenter-Client&metric=alert_status)](https://sonarcloud.io/project/overview?id=ita-social-projects_VictoryCenter-Client) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=ita-social-projects_VictoryCenter-Client&metric=coverage)](https://sonarcloud.io/dashboard?id=ita-social-projects_VictoryCenter-Client) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=ita-social-projects_VictoryCenter-Client&metric=bugs)](https://sonarcloud.io/dashboard?id=ita-social-projects_VictoryCenter-Client) [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=ita-social-projects_VictoryCenter-Client&metric=code_smells)](https://sonarcloud.io/dashboard?id=ita-social-projects_VictoryCenter-Client) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=ita-social-projects_VictoryCenter-Client&metric=security_rating)](https://sonarcloud.io/dashboard?id=ita-social-projects_VictoryCenter-Client)

- For more on these wonderful badges, refer to <a href="https://shields.io/" target="_blank">shields.io</a>.

---

## Available Scripts

In the project directory, you can run:

# Setup

To setup this project use this command in project folder:

### `npm install`

### `npm start`

Runs the app in the development mode.\
Open [https://localhost:3000](https://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run start-with-cert`

Runs the app in development mode over HTTPS, generating and trusting a local SSL certificate.\
Open [https://localhost:3000](https://localhost:3000) to view it in the browser without certificate warnings.\
The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run test:cover`

Launches the test runnner that will collect coverage info\
and present it in a form of a table in terminal.

### `npm run lint`

Launches the lint check that will allow to debug lint errors locally.

### `npm run format`

Lunches code formating process

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

## Installation

Ensure you have installed the [back-end project](https://github.com/ita-social-projects/VictoryCenter-Back) and the following prerequisites:

### Required to install

- Node.js (24.0.0) or higher
- npm (11.4.2) or higher

### Clone

Clone this repo to your local machine using:

```
git clone https://github.com/ita-social-projects/VictoryCenter-Client
```

### Setup

To setup this project use this command in project folder:

```
npm install
```

To enable HTTPS locally, you have two options:

- Either install OpenSSL, add it to your PATH and use this command to handle configuration for you and start the project:

```
npm run start-with-cert
```

- Or if you have any troubles, we have a few manual setup steps. Follow these instructions carefully:

#### Prerequisites

Before proceeding, ensure you have [mkcert](https://github.com/FiloSottile/mkcert?tab=readme-ov-file#installation) installed on your system.

#### Installation Steps

1. Create a `certs` folder in the root directory of cloned project.
2. Navigate to the `certs` folder in your console.
3. Run the following command to install local certificate authority:

```
mkcert -install
```

4. Run the following command to configure SSL certificates:

```
mkcert -key-file localhost-key.pem -cert-file localhost-cert.pem localhost 127.0.0.1 ::1
```

### Required to install

- Modify this section later

### Environment

- Modify this section later

environmental variables

```properties
spring.datasource.url=${DATASOURCE_URL}
spring.datasource.username=${DATASOURCE_USER}
spring.datasource.password=${DATASOURCE_PASSWORD}
spring.mail.username=${EMAIL_ADDRESS}
spring.mail.password=${EMAIL_PASSWORD}
cloud.name=${CLOUD_NAME}
api.key=${API_KEY}
api.secret=${API_SECRET}
```

## Contributing

### Git flow

> To get started...

#### Step 1

- **Option 1**
    - 🍴 Fork this repo!

- **Option 2**
    - 👯 Clone this repo to your local machine using `https://github.com/ita-social-projects/SOMEREPO.git`

#### Step 2

- **HACK AWAY!** 🔨🔨🔨

#### Step 3

- 🔃 Create a new pull request using <a href="https://github.com/ita-social-projects/SOMEREPO/compare/" target="_blank">github.com/ita-social-projects/SOMEREPO</a>.

### Issue flow

---

## Team

> Or Contributors/People

[![@IrynaZavushchak](https://avatars.githubusercontent.com/u/45690640?s=100&v=4)](https://github.com/IrynaZavushchak)
[![@LanchevychMaxym](https://avatars.githubusercontent.com/u/47561209?s=100&v=4)](https://github.com/LanchevychMaxym)

- You can just grab their GitHub profile image URL
- You should probably resize their picture using `?s=200` at the end of the image URL.

---

</div>

## Support

Reach out to us at one of the following places!

- Discord at <a href="https://discord.com/">`ira_zavushchak`</a>

---

## License

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
- Copyright 2025 © <a href="https://softserve.academy/" target="_blank"> SoftServe Academy</a>.
