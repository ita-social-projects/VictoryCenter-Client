import cn from 'classnames';
import { useMemo } from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import {
    PROGRAMS_TEXT,
    PROGRAM_SECTION_VALIDATION,
    SINGLE_TITLE_QUINTUPLE_DESCRIPTION_CONFIG,
} from '@/const/admin/programs';
import styles from './SingleTitleQuintupleDescription.module.scss';

export interface SingleTitleQuintupleDescriptionProps {
    title?: string;
    descriptions?: string[];
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionsChange?: (index: number, value: string) => void;
    className?: string;
}

export const SingleTitleQuintupleDescription = ({
    title = '',
    descriptions = [],
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionsChange,
    className = '',
}: SingleTitleQuintupleDescriptionProps) => {
    const normalizedDescriptions = useMemo(() => {
        const count = SINGLE_TITLE_QUINTUPLE_DESCRIPTION_CONFIG.descriptionsCount;
        return Array.from({ length: count }, (_, i) => descriptions[i] ?? '');
    }, [descriptions]);

    if (isEditable) {
        return (
            <div className={cn(styles.container, styles.editable, className)}>
                <div className={styles.editableGrid}>
                    <div className={styles.titleCell}>
                        <InputWithCharacterLimitGroup
                            className={styles.titleInputGroup}
                            label={PROGRAMS_TEXT.SECTION.FORM.TITLE.TEXT}
                            isRequired={true}
                            id="single-title-quintuple-title"
                            name="single-title-quintuple-title"
                            value={title}
                            onChange={(e) => onTitleChange?.(e.target.value)}
                            maxLength={PROGRAM_SECTION_VALIDATION.title.max}
                            placeholder={PROGRAMS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER}
                        />
                    </div>

                    <div className={styles.descriptionCard}>
                        <TextAreaWithCharacterLimitGroup
                            className={styles.descriptionInputGroup}
                            label={PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}
                            isRequired={true}
                            id="single-title-quintuple-desc-1"
                            name="single-title-quintuple-desc-1"
                            value={normalizedDescriptions[1]}
                            onChange={(e) => onDescriptionsChange?.(1, e.target.value)}
                            maxLength={PROGRAM_SECTION_VALIDATION.description.max}
                            rows={4}
                        />
                    </div>

                    <div className={styles.descriptionCard}>
                        <TextAreaWithCharacterLimitGroup
                            className={styles.descriptionInputGroup}
                            label={PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}
                            isRequired={true}
                            id="single-title-quintuple-desc-2"
                            name="single-title-quintuple-desc-2"
                            value={normalizedDescriptions[2]}
                            onChange={(e) => onDescriptionsChange?.(2, e.target.value)}
                            maxLength={PROGRAM_SECTION_VALIDATION.description.max}
                            rows={4}
                        />
                    </div>

                    <div className={styles.descriptionCard}>
                        <TextAreaWithCharacterLimitGroup
                            className={styles.descriptionInputGroup}
                            label={PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}
                            isRequired={true}
                            id="single-title-quintuple-desc-0"
                            name="single-title-quintuple-desc-0"
                            value={normalizedDescriptions[0]}
                            onChange={(e) => onDescriptionsChange?.(0, e.target.value)}
                            maxLength={PROGRAM_SECTION_VALIDATION.description.max}
                            rows={4}
                        />
                    </div>

                    <div className={styles.descriptionCard}>
                        <TextAreaWithCharacterLimitGroup
                            className={styles.descriptionInputGroup}
                            label={PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}
                            isRequired={true}
                            id="single-title-quintuple-desc-3"
                            name="single-title-quintuple-desc-3"
                            value={normalizedDescriptions[3]}
                            onChange={(e) => onDescriptionsChange?.(3, e.target.value)}
                            maxLength={PROGRAM_SECTION_VALIDATION.description.max}
                            rows={4}
                        />
                    </div>

                    <div className={styles.descriptionCard}>
                        <TextAreaWithCharacterLimitGroup
                            className={styles.descriptionInputGroup}
                            label={PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}
                            isRequired={true}
                            id="single-title-quintuple-desc-4"
                            name="single-title-quintuple-desc-4"
                            value={normalizedDescriptions[4]}
                            onChange={(e) => onDescriptionsChange?.(4, e.target.value)}
                            maxLength={PROGRAM_SECTION_VALIDATION.description.max}
                            rows={4}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(styles.container, { [styles.template]: isTemplate }, className)}>
            <div className={styles.previewLayout}>
                <div className={styles.previewTitleBlock}>
                    <h2 className={styles.previewTitleText}>{title}</h2>
                </div>

                <div className={styles.previewCardsBlock}>
                    <div className={styles.previewRowTop}>
                        <div className={styles.previewCard}>
                            <p className={styles.previewText}>{normalizedDescriptions[0]}</p>
                        </div>
                        <div className={styles.previewCard}>
                            <p className={styles.previewText}>{normalizedDescriptions[1]}</p>
                        </div>
                    </div>

                    <div className={styles.previewRowBottom}>
                        <div className={styles.previewCard}>
                            <p className={styles.previewText}>{normalizedDescriptions[2]}</p>
                        </div>
                        <div className={styles.previewCard}>
                            <p className={styles.previewText}>{normalizedDescriptions[3]}</p>
                        </div>
                        <div className={styles.previewCard}>
                            <p className={styles.previewText}>{normalizedDescriptions[4]}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
