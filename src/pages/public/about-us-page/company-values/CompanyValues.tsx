import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './CompanyValues.scss';
import { CustomSwiper } from '../../../../components/public/swiper/CustomSwiper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ValueCard } from './components/value-card/ValueCard';

export interface ValueItem {
    NAME: string;
    DESCRIPTION: string;
}

export const CompanyValues = () => {
    const [chunkedValues, setChunkedValues] = useState<ValueItem[][]>([]);
    const isTablet = useMediaQuery('(min-width:768px) and (max-width:1024px)');

    const { t } = useTranslation('aboutUsPage');
    const valueItems = useMemo<ValueItem[]>(() => t('VALUE_ITEMS', { returnObjects: true }) as ValueItem[], [t]);

    useEffect(() => {
        const chunkValues = (values: ValueItem[]): ValueItem[][] => {
            if (isTablet) {
                return values.reduce((acc: ValueItem[][], _, i) => {
                    if (i === 0 || i === acc.flat().length) {
                        const isFour = acc.length % 2 === 0;
                        const size = isFour ? 4 : 5;
                        acc.push(values.slice(i, i + size));
                    }
                    return acc;
                }, []);
            } else {
                return values.reduce((acc: ValueItem[][], _, i) => {
                    if (i % 3 === 0) acc.push(values.slice(i, i + 3));
                    return acc;
                }, []);
            }
        };
        setChunkedValues(chunkValues(valueItems));
    }, [isTablet, valueItems]);

    return (
        <div className="values-block">
            <CustomSwiper
                items={chunkedValues}
                slidesPerView={1}
                breakpoints={{
                    568: { slidesPerView: 2 },
                    768: { slidesPerView: 2 },
                    1025: { slidesPerView: 3 },
                }}
                renderItem={(group, groupIndex) => <ValueCard group={group} groupIndex={groupIndex} />}
            />
        </div>
    );
};
