import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/admin/button/Button';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { AboutUsBlockValidationSchema } from '@/validation/admin/main-page-schema/main-page-schema';
import { MainPage, AboutUsBlockFormValues, ABOUT_US_BLOCK_FORM_DEFAULTS } from '@/types/admin/main-page';
import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';

import styles from './AboutUsBlockForm.module.scss';

interface AboutUsBlockFormProps {
    initialData: MainPage | null;
}

export const AboutUsBlockForm = ({ initialData }: AboutUsBlockFormProps) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty, isValid, errors },
    } = useForm<AboutUsBlockFormValues>({
        mode: 'onChange',
        resolver: yupResolver(AboutUsBlockValidationSchema),
        defaultValues: ABOUT_US_BLOCK_FORM_DEFAULTS,
    });

    useEffect(() => {
        if (initialData?.mainAboutUs) {
            reset({
                title: initialData.mainAboutUs.title || '',
                description: initialData.mainAboutUs.description || '',
            });
        }
    }, [initialData, reset]);

    const onSubmit = (data: AboutUsBlockFormValues) => {
        // TODO: Implement API call
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.content}>
                <div className={styles.column}>
                    <Controller
                        name="title"
                        control={control}
                        render={({ field: { onChange, value, onBlur, name } }) => (
                            <InputWithCharacterLimitGroup
                                id="about-us-block-title"
                                name={name}
                                label={MAIN_PAGE_TEXT.BLOCKS.ABOUT_US.TITLE_LABEL}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={errors.title?.message}
                                maxLength={MAIN_PAGE_VALIDATION.title.max}
                                isRequired={true}
                            />
                        )}
                    />
                </div>

                <div className={styles.column}>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field: { onChange, value, onBlur, name } }) => (
                            <TextAreaWithCharacterLimitGroup
                                id="about-us-block-description"
                                name={name}
                                label={MAIN_PAGE_TEXT.BLOCKS.ABOUT_US.DESCRIPTION_LABEL}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={errors.description?.message}
                                maxLength={MAIN_PAGE_VALIDATION.description.max}
                                isRequired={true}
                                rows={14}
                                className={styles['textarea-custom']}
                            />
                        )}
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <Button
                    type="submit"
                    buttonStyle="primary"
                    disabled={!isDirty || !isValid}
                    className={styles['publish-button']}
                >
                    {MAIN_PAGE_TEXT.BUTTONS.PUBLISH}
                </Button>
            </div>
        </form>
    );
};
