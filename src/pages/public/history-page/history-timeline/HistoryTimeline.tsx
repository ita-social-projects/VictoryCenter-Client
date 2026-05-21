import { useTranslation } from 'react-i18next';
import nastyaDirector from '@/assets/images/history/nastya-director.png';
import nastyaVolunteer from '@/assets/images/history/nastya-volunteer.png';
import svyatMilitary from '@/assets/images/history/svyat-military.png';
import yuliaParamedic from '@/assets/images/history/yulia-paramedic.png';
import olegMilitary from '@/assets/images/history/oleg-military.png';
import sofiaVolunteer from '@/assets/images/history/sofia-volunteer.png';
import styles from './HistoryTimeline.module.scss';

const TIMELINE_DATES = [
    '09/2023',
    '10/2023',
    '11/2023',
    '12/2023',
    '01/2024',
    '02/2024',
    '03/2024',
    '04/2024',
    '05/2024',
    '06/2024',
    '07/2024',
    '08/2024',
    '09/2024',
    '10/2024',
    '11/2024',
    '12/2024',
    '01/2025',
    '02/2025',
];

type PhotoCaptionKey =
    | 'PHOTO_NASTYA_DIRECTOR_NAME'
    | 'PHOTO_NASTYA_DIRECTOR_ROLE'
    | 'PHOTO_NASTYA_VOLUNTEER_NAME'
    | 'PHOTO_NASTYA_VOLUNTEER_ROLE'
    | 'PHOTO_SVYAT_MILITARY_NAME'
    | 'PHOTO_SVYAT_MILITARY_ROLE'
    | 'PHOTO_YULIA_PARAMEDIC_NAME'
    | 'PHOTO_YULIA_PARAMEDIC_ROLE'
    | 'PHOTO_OLEG_MILITARY_NAME'
    | 'PHOTO_OLEG_MILITARY_ROLE'
    | 'PHOTO_SOFIA_VOLUNTEER_NAME'
    | 'PHOTO_SOFIA_VOLUNTEER_ROLE';

interface PhotoConfig {
    src: string;
    nameKey: PhotoCaptionKey;
    roleKey: PhotoCaptionKey;
    width: number;
    height: number;
    tabletWidth?: number;
    tabletHeight?: number;
    mobileWidth?: number;
    mobileHeight?: number;
    offsetX?: number;
}

interface LineConfig {
    xl: number;
    mobile: number;
    topAnchor?: boolean;
    showFrom: 'all' | 'tablet' | 'desktop';
    photo?: PhotoConfig;
    side: 'left' | 'right';
}

const HIGHLIGHTED_DATES: Record<string, LineConfig> = {
    '09/2023': {
        xl: 158,
        mobile: 158,
        showFrom: 'all',
        side: 'left',
        photo: {
            src: nastyaDirector,
            nameKey: 'PHOTO_NASTYA_DIRECTOR_NAME',
            roleKey: 'PHOTO_NASTYA_DIRECTOR_ROLE',
            width: 265,
            height: 177,
            tabletWidth: 204,
            tabletHeight: 136,
            mobileWidth: 168,
            mobileHeight: 112,
            offsetX: -80,
        },
    },
    '12/2023': {
        xl: 480,
        mobile: 700,
        topAnchor: true,
        showFrom: 'all',
        side: 'right',
        photo: {
            src: nastyaVolunteer,
            nameKey: 'PHOTO_NASTYA_VOLUNTEER_NAME',
            roleKey: 'PHOTO_NASTYA_VOLUNTEER_ROLE',
            width: 195,
            height: 130,
            tabletWidth: 195,
            tabletHeight: 130,
            mobileWidth: 179,
            mobileHeight: 120,
            offsetX: 30,
        },
    },
    '03/2024': {
        xl: 44,
        mobile: 44,
        showFrom: 'tablet',
        side: 'left',
        photo: {
            src: svyatMilitary,
            nameKey: 'PHOTO_SVYAT_MILITARY_NAME',
            roleKey: 'PHOTO_SVYAT_MILITARY_ROLE',
            width: 196,
            height: 131,
            tabletWidth: 196,
            tabletHeight: 131,
            offsetX: -25,
        },
    },
    '06/2024': {
        xl: 550,
        mobile: 700,
        showFrom: 'tablet',
        side: 'left',
        photo: {
            src: yuliaParamedic,
            nameKey: 'PHOTO_YULIA_PARAMEDIC_NAME',
            roleKey: 'PHOTO_YULIA_PARAMEDIC_ROLE',
            width: 192,
            height: 128,
            tabletWidth: 192,
            tabletHeight: 128,
            offsetX: -15,
        },
    },
    '09/2024': {
        xl: 40,
        mobile: 0,
        showFrom: 'desktop',
        side: 'left',
        photo: {
            src: olegMilitary,
            nameKey: 'PHOTO_OLEG_MILITARY_NAME',
            roleKey: 'PHOTO_OLEG_MILITARY_ROLE',
            width: 247,
            height: 165,
            offsetX: -70,
        },
    },
    '12/2024': {
        xl: 450,
        mobile: 0,
        showFrom: 'desktop',
        side: 'left',
        photo: {
            src: sofiaVolunteer,
            nameKey: 'PHOTO_SOFIA_VOLUNTEER_NAME',
            roleKey: 'PHOTO_SOFIA_VOLUNTEER_ROLE',
            width: 274,
            height: 183,
            offsetX: -55,
        },
    },
};

const getLineClass = (config: LineConfig): string => {
    const visClass =
        config.showFrom === 'all'
            ? styles['date--line-all']
            : config.showFrom === 'tablet'
              ? styles['date--line-tablet']
              : styles['date--line-desktop'];
    return config.topAnchor ? `${visClass} ${styles['date--line-top-anchor']}` : visClass;
};

export const HistoryTimeline = () => {
    const { t } = useTranslation('historyPage');

    return (
        <div className={styles.timeline}>
            <div className={styles['dates-row']}>
                {TIMELINE_DATES.map((date) => {
                    const config = HIGHLIGHTED_DATES[date];
                    const isActive = Boolean(config);
                    return (
                        <span
                            key={date}
                            className={`${styles.date} ${isActive ? `${styles['date--active']} ${getLineClass(config)}` : ''}`}
                            style={
                                isActive
                                    ? ({
                                          '--line-mobile': `${config.mobile}px`,
                                          '--line-xl': `${config.xl}px`,
                                      } as React.CSSProperties)
                                    : undefined
                            }
                        >
                            {isActive && <span className={styles['date-line']} />}
                            {isActive && config.photo && (
                                <div
                                    className={`${styles['photo-card']} ${
                                        config.side === 'right'
                                            ? styles['photo-card--right']
                                            : styles['photo-card--left']
                                    }`}
                                    style={
                                        {
                                            '--photo-w-desktop': `${config.photo.width}px`,
                                            '--photo-h-desktop': `${config.photo.height}px`,
                                            ...(config.photo.tabletWidth !== undefined && {
                                                '--photo-w-tablet': `${config.photo.tabletWidth}px`,
                                            }),
                                            ...(config.photo.tabletHeight !== undefined && {
                                                '--photo-h-tablet': `${config.photo.tabletHeight}px`,
                                            }),
                                            ...(config.photo.mobileWidth !== undefined && {
                                                '--photo-w-mobile': `${config.photo.mobileWidth}px`,
                                            }),
                                            ...(config.photo.mobileHeight !== undefined && {
                                                '--photo-h-mobile': `${config.photo.mobileHeight}px`,
                                            }),
                                            '--img-offset-desktop': `${config.photo.offsetX ?? 0}px`,
                                        } as React.CSSProperties
                                    }
                                >
                                    <img
                                        src={config.photo.src}
                                        alt={`${t(config.photo.nameKey)}, ${t(config.photo.roleKey)}`}
                                        className={styles['photo-img']}
                                    />
                                    <div className={styles['photo-caption-row']}>
                                        {config.side === 'left' && <span className={styles['photo-dot']} />}
                                        <p className={styles['photo-caption']}>
                                            {t(config.photo.nameKey)}, {t(config.photo.roleKey)}
                                        </p>
                                        {config.side === 'right' && <span className={styles['photo-dot']} />}
                                    </div>
                                </div>
                            )}
                            {date}
                        </span>
                    );
                })}
                <span className={styles['dates-ellipsis']}>…</span>
            </div>
        </div>
    );
};
