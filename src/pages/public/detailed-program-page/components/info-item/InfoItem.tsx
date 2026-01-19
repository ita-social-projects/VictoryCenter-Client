import React from 'react';
import styles from './InfoItem.module.scss';

interface InfoItemProps {
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    text: string | number;
}

export const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, text }) => (
    <span className={styles['info-item']}>
        <Icon width={24} height={24} />
        {text}
    </span>
);
