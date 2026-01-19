import styles from './ProgramsSection.module.scss';
import { ProgramCard } from '@/components/public/program-card/ProgramCard';
import { Swiper } from '@/components/public/swiper/Swiper';
import { ProgramsPageData } from '@/types/public/programs-page';
import { ReactComponent as ArrowRight } from '@/assets/icons/arrow-right.svg';
import { ReactComponent as ArrowLeft } from '@/assets/icons/arrow-left.svg';

export interface ProgramsSectionProps {
    content: ProgramsPageData | null;
}

export const ProgramsSection = ({ content }: ProgramsSectionProps) => {
    return (
        <div className={styles.root}>
            <div className={styles.swiper}>
                <Swiper
                    items={content?.programsData ?? null}
                    renderItem={(program) => <ProgramCard program={program} variant="whoWeAre" />}
                    showScrollbar={{ isVisible: true, className: styles.line, classNameDrag: styles.drag }}
                    classNameSwiperSlide={styles[`swiper-slide`]}
                    navigationButtons={{
                        prev: {
                            icon: ArrowLeft,
                            ariaLabel: 'back',
                            variant: 'primary-dark',
                            className: styles.left,
                        },
                        next: {
                            icon: ArrowRight,
                            ariaLabel: 'next',
                            variant: 'primary-dark',
                            className: styles.right,
                        },
                    }}
                />
            </div>
            <div className={styles.scrollbar}>
                <div className={styles.line} />
            </div>
        </div>
    );
};
