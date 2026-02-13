// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import i18n from './locales/i18n';

i18n.changeLanguage('uk');

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

process.env.REACT_APP_BACKEND_URL = 'mocked-backend-url';

HTMLElement.prototype.scrollIntoView = jest.fn();
