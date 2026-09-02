import * as Yup from 'yup';

export function requiredNotWhitespaceOnlyTest(
    getMessage: () => string,
): [string, string, Yup.TestFunction<string | undefined>] {
    return ['required-not-whitespace-only', getMessage(), (value) => value !== undefined && value.trim().length > 0];
}

export function noLeadingTrailingSpacesTest(
    getMessage: () => string,
): [string, string, Yup.TestFunction<string | undefined>] {
    return ['no-leading-trailing-spaces', getMessage(), (value) => value === undefined || value === value.trim()];
}
