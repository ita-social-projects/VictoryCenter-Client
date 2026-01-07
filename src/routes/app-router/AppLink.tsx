import { Link, LinkProps, useSearchParams } from 'react-router-dom';

export const AppLink = ({ to, children, ...props }: LinkProps) => {
    const [searchParams] = useSearchParams();
    const lang = searchParams.get('lang');

    // Якщо параметр lang існує, додаємо його до цільового шляху
    const localizedTo = lang ? `${to}${typeof to === 'string' && to.includes('?') ? '&' : '?'}lang=${lang}` : to;

    return (
        <Link {...props} to={localizedTo}>
            {children}
        </Link>
    );
};
