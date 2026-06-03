import cn from 'classnames';
import styles from './CarouselNavButton.module.scss';

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export type CarouselNavButtonProps = {
    side: 'left' | 'right';
    variant?: 'default' | 'template' | 'editable';
    ariaLabel: string;
    Icon: IconComponent;
    onClick: () => void;
};

export const CarouselNavButton = ({ side, variant = 'default', ariaLabel, Icon, onClick }: CarouselNavButtonProps) => {
    return (
        <button
            type="button"
            className={cn(styles.button, {
                [styles.left]: side === 'left',
                [styles.right]: side === 'right',
                [styles.template]: variant === 'template',
            })}
            onClick={onClick}
            aria-label={ariaLabel}
        >
            <Icon />
        </button>
    );
};
