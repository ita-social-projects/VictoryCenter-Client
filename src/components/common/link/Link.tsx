import { Link as RouterLink, LinkProps } from 'react-router-dom';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { DEFAULT_LOCALE } from '@/const/common/locales';

type AppLinkProps = Omit<LinkProps, 'to'> & {
    to: string;
};

export const Link = ({ to, children, ...props }: AppLinkProps) => {
    const { currentLanguage } = useLocale();

    const getLocalizedPath = (path: string): typeof path => {
        if (currentLanguage === DEFAULT_LOCALE) return path;

        if (path.startsWith(`/${currentLanguage}`)) return path;

        if (path === '/') return `/${currentLanguage}`;

        return path;
    };
    return (
        <RouterLink {...props} to={getLocalizedPath(to)}>
            {children}
        </RouterLink>
    );
};
