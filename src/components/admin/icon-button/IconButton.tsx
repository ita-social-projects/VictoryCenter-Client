import cn from 'classnames';
import styles from './IconButton.module.scss';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    DefaultIcon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    FilledIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | null;
}

export const IconButton = ({ DefaultIcon, FilledIcon, className, ...props }: IconButtonProps) => (
    <button {...props} className={cn(styles['icon-btn'], className)}>
        <DefaultIcon className={FilledIcon ? styles['icon-default'] : undefined} />
        {FilledIcon && <FilledIcon className={styles['icon-filled']} />}
    </button>
);
