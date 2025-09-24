import 'i18next';
import aboutUsPage from '../../locales/uk/about-us.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    // inferring types automatically (such as arrays of objects)
    resources: {
      aboutUsPage: typeof aboutUsPage;
    };
  }
}
