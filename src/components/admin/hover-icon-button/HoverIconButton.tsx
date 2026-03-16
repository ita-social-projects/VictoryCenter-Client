import cn from 'classnames';
import styles from './HoverIconButton.module.scss';

export interface HoverIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    DefaultIcon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    HoverIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | null;
}

export const HoverIconButton = ({ DefaultIcon, HoverIcon, className, ...props }: HoverIconButtonProps) => (
    <button {...props} className={cn(styles['icon-btn'], className)}>
        <DefaultIcon className={HoverIcon ? styles['icon-default'] : undefined} />
        {HoverIcon && <HoverIcon className={styles['icon-hover']} />}
    </button>
);
