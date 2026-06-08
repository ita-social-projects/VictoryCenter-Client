import { Button } from '@/components/admin/button/Button';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { MainPageFormValues } from '@/types/admin/main-page';
import { Controller, useFormContext } from 'react-hook-form';

import styles from './AboutUsBlockForm.module.scss';

interface AboutUsBlockFormProps {
    isPublishDisabled: boolean;
    onPublish: () => void;
    isReadOnly?: boolean;
}

export const AboutUsBlockForm = ({
    isPublishDisabled,
    onPublish,
    isReadOnly = false,
}: AboutUsBlockFormProps) => {
    const {
        control,
        formState: { errors },
    } = useFormContext<MainPageFormValues>();

    const titleName = isReadOnly ? 'aboutUsTitleEn' : 'aboutUsTitleUa';
    const descriptionName = isReadOnly ? 'aboutUsDescriptionEn' : 'aboutUsDescriptionUa';

    return (
        <div className={styles.form}>
            <div className={styles.content}>
                <div className={styles.column}>
                    <Controller
                        name={titleName}
                        control={control}
                        render={({ field: { onChange, value, onBlur, name } }) => (
                            <InputWithCharacterLimitGroup
                                id="about-us-block-title"
                                name={name}
                                label={MAIN_PAGE_TEXT.BLOCKS.ABOUT_US.TITLE_LABEL}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={isReadOnly ? undefined : errors.aboutUsTitleUa?.message}
                                maxLength={MAIN_PAGE_VALIDATION.aboutUsBlock.title.max}
                                isRequired={true}
                                disabled={isReadOnly}
                            />
                        )}
                    />
                </div>

                <div className={styles.column}>
                    <Controller
                        name={descriptionName}
                        control={control}
                        render={({ field: { onChange, value, onBlur, name } }) => (
                            <TextAreaWithCharacterLimitGroup
                                id="about-us-block-description"
                                name={name}
                                label={MAIN_PAGE_TEXT.BLOCKS.ABOUT_US.DESCRIPTION_LABEL}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={isReadOnly ? undefined : errors.aboutUsDescriptionUa?.message}
                                maxLength={MAIN_PAGE_VALIDATION.aboutUsBlock.description.max}
                                isRequired={true}
                                rows={14}
                                className={styles['textarea-custom']}
                                disabled={isReadOnly}
                            />
                        )}
                    />
                </div>
            </div>

            {!isReadOnly && (
                <div className={styles.actions}>
                    <Button
                        type="button"
                        buttonStyle="primary"
                        disabled={isPublishDisabled}
                        className={styles['publish-button']}
                        onClick={onPublish}
                    >
                        {MAIN_PAGE_TEXT.BUTTONS.PUBLISH}
                    </Button>
                </div>
            )}
        </div>
    );
};
