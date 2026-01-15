import { Link as RouterLink, LinkProps } from 'react-router-dom';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { DEFAULT_LOCALE } from '@/const/common/locales';

export const Link = ({ to, children, ...props }: LinkProps) => {
    const { currentLanguage } = useLocale();

    const getLocalizedPath = (
        path: string | Partial<{ pathname: string; search?: string; hash?: string }>,
    ): typeof path => {
        if (typeof path !== 'string') {
            if (path.pathname) {
                return {
                    ...path,
                    pathname: getLocalizedPath(path.pathname) as string,
                };
            }
            return path;
        }

        if (currentLanguage === DEFAULT_LOCALE) return path;

        if (path.startsWith(`/${currentLanguage}`)) return path;

        return `/${currentLanguage}${path.startsWith('/') ? path : `/${path}`}`;
    };

    return (
        <RouterLink {...props} to={getLocalizedPath(to)}>
            {children}
        </RouterLink>
    );
};
