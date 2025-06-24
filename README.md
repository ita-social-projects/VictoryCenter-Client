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
│   │   ├── test.build.yml
│   │   └── ci.build.yml
│   ├── CODEOWNERS
│   └── pull_request_template.md
├── nginx/
│   └── nginx.conf
├── public/
│   └── index.html
├── src/
│   ├── assets/                             # Images, icons, fonts, etc.
│   │   ├── fonts/                          
│   │   ├── icons/                          
│   │   ├── images/                         # Image assets
│   │   │   ├── footer
│   │   │   ├── admin/                      
│   │   │   └── header/ 
│   │   ├── sass/
│   │   │     ├── mixins
│   │   │      └── variables                   
│   │   └── styles/                         # Additional styles
│   ├── components/                         # Reusable UI components (buttons, inputs, etc.)
│   │   ├── admin/                          # Admin-specific components
│   │   │   └── admin-navigation/          
│   │   ├── common/                         # Shared UI components
│   │   │   ├── button/                     
│   │   │   ├── input/                      
│   │   │   ├── modal/                      
│   │   │   └── select/  
|   |   ├── footer                   
│   │   └── header/                         # Header-related components
│   ├── const/                              # Constants used across the project
|   |   ├── footer
│   │   ├── header/                         
│   │   ├── routes/                         
│   ├── layouts/                            # Layout components (e.g., MainLayout, AuthLayout)
│   │   ├── admin-layout/                   
│   │   └── main-layout/                               
│   ├── pages/                              # Page components
│   │   ├── admin/                          # Admin pages
│   │   │   ├── admin-page-content/         # Content components for admin pages
│   │   │   └── team/                       # Team management page
│   │   │       └── components/             # Components specific to team page
│   │   ├── not-found/                      
│   │   └── user-pages/                     
│   │       ├── home/                      
│   │       ├── page1/                         
│   │       └── page2/                      
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
│   │   └── mock-data/                      
│   │       ├── admin-page/                 # Mock data for admin pages
│   │       └── user-pages/                 # Mock data for user pages
│   │           ├── home-page/              
│   │           ├── page-1/                 
│   │           └── page-2/                 
│   ├── index.jsx                           # Entry point (ReactDOM.createRoot)
│   ├── index.css                           # Global styles (normalizer)
│   ├── react-app-env.d.ts
│   ├── reportWebVitals.ts
│   └── setupTests.ts
├── .coderabbit.yaml                        
├── .dockerignore                           
├── .gitignore
├── Dockerfile
├── LICENSE
├── package-lock.json
├── package.json
├── README
└── tsconfig.json
</code></pre>

[![Build Status](https://img.shields.io/travis/ita-social-projects/VictoryCenter-Client/main?style=flat-square)](https://travis-ci.org/github/ita-social-projects/VictoryCenter-Client)
[![Coverage Status](https://img.shields.io/gitlab/coverage/ita-social-projects/VictoryCenter-Client/main?style=flat-square)](https://coveralls.io)
[![Github Issues](https://img.shields.io/github/issues/ita-social-projects/VictoryCenter-Client?style=flat-square)](https://github.com/ita-social-projects/VictoryCenter-Client/issues)
[![Pending Pull-Requests](https://img.shields.io/github/issues-pr/ita-social-projects/VictoryCenter-Client?style=flat-square)](https://github.com/ita-social-projects/VictoryCenter-Client/pulls)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ita-social-projects_VictoryCenter-Client&metric=alert_status)](https://sonarcloud.io/project/overview?id=ita-social-projects_VictoryCenter-Client) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=ita-social-projects_VictoryCenter-Client&metric=coverage)](https://sonarcloud.io/dashboard?id=ita-social-projects_VictoryCenter-Client) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=ita-social-projects_VictoryCenter-Client&metric=bugs)](https://sonarcloud.io/dashboard?id=ita-social-projects_VictoryCenter-Client) [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=ita-social-projects_VictoryCenter-Client&metric=code_smells)](https://sonarcloud.io/dashboard?id=ita-social-projects_VictoryCenter-Client) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=ita-social-projects_VictoryCenter-Client&metric=security_rating)](https://sonarcloud.io/dashboard?id=ita-social-projects_VictoryCenter-Client)

- For more on these wonderful  badges, refer to <a href="https://shields.io/" target="_blank">shields.io</a>.

---

## Available Scripts

In the project directory, you can run:

# Setup
To setup this project use this command in project folder:

### `npm install`

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

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

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

## Installation
 - Modify this section later

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
