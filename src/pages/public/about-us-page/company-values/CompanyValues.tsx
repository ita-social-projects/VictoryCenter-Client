import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Swiper } from '@/components/public/swiper/Swiper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ValueCard } from './components/value-card/ValueCard';
import styles from './CompanyValues.module.scss';
import { ReactComponent as ArrowRight } from '@/assets/icons/arrow-right.svg';

export type ValueItem = Record<string, string>;

const chunk = <T,>(arr: T[], size: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
};

const chunkStaggered = (values: ValueItem[]): ValueItem[][] => {
    const result: ValueItem[][] = [];
    let i = 0;
    while (i < values.length) {
        const size = result.length % 2 === 0 ? 4 : 5;
        result.push(values.slice(i, i + size));
        i += size;
    }
    return result;
};

const toCamelCaseValues = (items: Record<string, string>[]): ValueItem[] =>
    items.map(({ NAME, DESCRIPTION }) => ({
        name: NAME,
        description: DESCRIPTION,
    }));

export const CompanyValues = () => {
    const isTablet = useMediaQuery('(min-width:768px) and (max-width:1439px)');
    const { t } = useTranslation('aboutUsPage');

    const data = useMemo<Record<string, string>[]>(() => {
        return t('VALUE_ITEMS', { returnObjects: true }) as Record<string, string>[];
    }, [t]);

    const valueItems = useMemo<ValueItem[]>(() => toCamelCaseValues(data), [data]);

    const chunkedValues = useMemo(() => {
        if (isTablet) {
            return chunkStaggered(valueItems);
        }
        return chunk(valueItems, 3);
    }, [isTablet, valueItems]);

    return (
        <div className={styles.root}>
            <Swiper
                items={chunkedValues}
                slidesPerView={'auto'}
                breakpoints={{
                    560: { slidesPerView: 2 },
                    768: { slidesPerView: 2 },
                    1440: { slidesPerView: 3 },
                }}
                renderItem={(group, groupIndex) => <ValueCard key={groupIndex} group={group} groupIndex={groupIndex} />}
                classNameSwiperSlide={styles[`swiper-slide`]}
                navigationButtons={{
                    next: {
                        icon: ArrowRight,
                        ariaLabel: 'next',
                        variant: 'primary-dark',
                        className: styles.right,
                    },
                }}
            />
        </div>
    );
};
