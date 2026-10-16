const SPACE_RUN = /[ \u00A0]+/g;
const LEADING_SPACES = /^[ \u00A0]+/;

export const endsWithSpace = (text: string) => /[ \u00A0]$/.test(text);

export const startsWithSpace = (text: string) => LEADING_SPACES.test(text);

export const normalizeSpaces = (text: string, stripLeading: boolean) => {
    const collapsed = text.replace(SPACE_RUN, ' ');
    return stripLeading ? collapsed.replace(LEADING_SPACES, '') : collapsed;
};
