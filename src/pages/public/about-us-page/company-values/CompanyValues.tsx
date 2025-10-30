import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { useMemo } from 'react';
import './CompanyValues.scss';
import { Swiper } from '../../../../components/public/swiper/Swiper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ValueCard } from './components/value-card/ValueCard';

export interface ValueItem {
    NAME: string;
    DESCRIPTION: string;
}

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

export const CompanyValues = () => {
    const isTablet = useMediaQuery('(min-width:768px) and (max-width:1024px)');
    const chunkedValues = useMemo(() => {
        const values = ABOUT_US_DATA.VALUE_ITEMS;
        if (isTablet) {
            return chunkStaggered(values);
        }
        return chunk(values, 3);
    }, [isTablet]);

    return (
        <div className="values-block">
            <Swiper
                items={chunkedValues}
                slidesPerView={1}
                breakpoints={{
                    568: { slidesPerView: 2 },
                    768: { slidesPerView: 2 },
                    1025: { slidesPerView: 3 },
                }}
                renderItem={(group, groupIndex) => <ValueCard key={groupIndex} group={group} groupIndex={groupIndex} />}
            />
        </div>
    );
};
