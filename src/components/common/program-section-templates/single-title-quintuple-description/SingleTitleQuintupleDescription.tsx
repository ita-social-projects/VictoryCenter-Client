import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import styles from './SingleTitleQuintupleDescription.module.scss';
import { PROGRAMS_TEXT, PROGRAM_SECTION_TEMPLATE_CONFIG, PROGRAM_SECTION_VALIDATION } from '@/const/admin/programs';

export interface SingleTitleQuintupleDescriptionProps {
    title?: string;
    descriptions?: string[];
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionsChange?: (index: number, value: string) => void;
}

const TEMPLATE_CONFIG = PROGRAM_SECTION_TEMPLATE_CONFIG.SINGLE_TITLE_QUINTUPLE_DESCRIPTION;

const normalizeDescriptions = (descriptions: string[] | undefined, count: number) => {
    const src = descriptions ?? [];
    return Array.from({ length: count }, (_, i) => src[i] ?? '');
};

export const SingleTitleQuintupleDescription = ({
    title = '',
    descriptions,
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionsChange,
}: SingleTitleQuintupleDescriptionProps) => {
    const values = useMemo(
        () => normalizeDescriptions(descriptions, TEMPLATE_CONFIG.descriptionsCount),
        [descriptions],
    );

    const templateWrapRef = useRef<HTMLDivElement | null>(null);
    const [templateScale, setTemplateScale] = useState(1);

    useLayoutEffect(() => {
        if (!isTemplate || isEditable) return;

        const el = templateWrapRef.current;
        if (!el) return;

        const { width: W, height: H, minScale, maxScale } = TEMPLATE_CONFIG.preview;

        const update = () => {
            const rect = el.getBoundingClientRect();

            const byW = rect.width > 0 ? rect.width / W : 1;
            const byH = rect.height > 0 ? rect.height / H : Number.POSITIVE_INFINITY;

            const raw = Math.min(byW, byH);
            const s = Number.isFinite(raw) ? Math.max(minScale, Math.min(maxScale, raw)) : 1;

            setTemplateScale(s);
        };

        update();

        const ro = new ResizeObserver(() => update());
        ro.observe(el);

        return () => ro.disconnect();
    }, [isTemplate, isEditable]);

    if (isEditable) {
        return (
            <section className={cn(styles.container, styles.editable)}>
                <div className={styles.editableInner}>
                    <div className={styles.titleCell}>
                        <div className={styles.labelRow}>
                            <span className={styles.required}>{TEMPLATE_CONFIG.requiredMark}</span>
                            <span className={styles.labelText}>{PROGRAMS_TEXT.SECTION.FORM.TITLE.TEXT}</span>
                        </div>

                        <div className={styles.titleField}>
                            <input
                                className={cn(styles.titleInput, { [styles.titleInputFilled]: title.length > 0 })}
                                value={title}
                                placeholder={PROGRAMS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER}
                                maxLength={PROGRAM_SECTION_VALIDATION.title.max}
                                onChange={(e) => onTitleChange?.(e.target.value)}
                            />
                            <div className={styles.titleCounter}>
                                {title.length}/{PROGRAM_SECTION_VALIDATION.title.max}
                            </div>
                        </div>
                    </div>

                    {values.map((value, index) => (
                        <div key={index} className={styles.descCell}>
                            <div className={styles.labelRow}>
                                <span className={styles.required}>{TEMPLATE_CONFIG.requiredMark}</span>
                                <span className={styles.labelText}>
                                    {PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT} {index + 1}
                                </span>
                            </div>

                            <div className={styles.descField}>
                                <textarea
                                    className={styles.descTextarea}
                                    value={value}
                                    maxLength={PROGRAM_SECTION_VALIDATION.description.max}
                                    onChange={(e) => onDescriptionsChange?.(index, e.target.value)}
                                />
                            </div>

                            <div className={styles.descCounter}>
                                {value.length}/{PROGRAM_SECTION_VALIDATION.description.max}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    const Grid = () => (
        <div className={styles.displayInner}>
            <div className={styles.displayTitleCell}>
                <h2 className={styles.displayTitle}>{title}</h2>
            </div>

            <div className={cn(styles.card, styles.card1)}>
                <p className={styles.cardText}>{values[0]}</p>
            </div>

            <div className={cn(styles.card, styles.card2)}>
                <p className={styles.cardText}>{values[1]}</p>
            </div>

            <div className={cn(styles.card, styles.card3)}>
                <p className={styles.cardText}>{values[2]}</p>
            </div>

            <div className={cn(styles.card, styles.card4)}>
                <p className={styles.cardText}>{values[3]}</p>
            </div>

            <div className={cn(styles.card, styles.card5)}>
                <p className={styles.cardText}>{values[4]}</p>
            </div>
        </div>
    );

    const { width: W, height: H } = TEMPLATE_CONFIG.preview;
    const scaledW = W * templateScale;
    const scaledH = H * templateScale;

    return (
        <section className={cn(styles.container, styles.display, { [styles.template]: isTemplate })}>
            {isTemplate ? (
                <div ref={templateWrapRef} className={styles.templateWrap}>
                    <div className={styles.templateScaler} style={{ width: scaledW, height: scaledH }}>
                        <div
                            className={styles.templateStage}
                            style={{ width: W, height: H, transform: `scale(${templateScale})` }}
                        >
                            <Grid />
                        </div>
                    </div>
                </div>
            ) : (
                <Grid />
            )}
        </section>
    );
};
