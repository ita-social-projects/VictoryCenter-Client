import styles from './NotFoundMessage.module.scss';
import { DESCRIPTION, TEXT, GO_BACK_BUTTON } from '@/const/public/notfound-page';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-up-right.svg';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { Button } from '@/components/public/ui/button';

export const NotFoundMessage = () => {
    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <h4 className={styles.title}>{TEXT}</h4>
            </div>
            <div className={styles.content}>
                <p className={styles.description}>{DESCRIPTION}</p>
                <div className={styles.actions}>
                    <Button href={PUBLIC_ROUTES.ROOT} icon={ArrowIcon} iconPosition="right" variant="tertiary">
                        {GO_BACK_BUTTON}
                    </Button>
                </div>
            </div>
        </div>
    );
};
