import styles from './ProgramsSection.module.scss';
import { ProgramCard } from '@/components/public/program-card/ProgramCard';
import { Swiper } from '@/components/public/swiper/Swiper';
import { ProgramsPageData } from '@/types/public/programs-page';

export interface ProgramsSectionProps {
    content: ProgramsPageData | null;
}

const SWIPER_NAVIGATION_CONFIG = {
    prev: {
        className: styles.left,
    },
    next: {
        className: styles.right,
    },
};

export const ProgramsSection = ({ content }: ProgramsSectionProps) => {
    return (
        <div className={styles.root}>
            <div className={styles.swiper}>
                <Swiper
                    items={content?.programsData ?? null}
                    renderItem={(program) => <ProgramCard program={program} variant="whoWeAre" />}
                    showScrollbar={{ isVisible: true, className: styles.line, classNameDrag: styles.drag }}
                    classNameSwiperSlide={styles[`swiper-slide`]}
                    navigationButtons={SWIPER_NAVIGATION_CONFIG}
                />
            </div>
            <div className={styles.scrollbar}>
                <div className={styles.line} />
            </div>
        </div>
    );
};
