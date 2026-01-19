import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { localizePath } from '@/utils/functions/localize-path/localize-path';

type LinkProps = Omit<RouterLinkProps, 'to'> & {
    to: RouterLinkProps['to'];
};

export const Link = ({ to, children, ...props }: LinkProps) => {
    const { currentLanguage } = useLocale();
    return (
        <RouterLink {...props} to={localizePath(to, currentLanguage)}>
            {children}
        </RouterLink>
    );
};
