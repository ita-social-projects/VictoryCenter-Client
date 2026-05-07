import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/admin/button/Button';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { MainPage, PARTNERS_BLOCK_FORM_DEFAULTS, PartnersBlockFormValues } from '@/types/admin/main-page';
import { PartnersBlockValidationSchema } from '@/validation/admin/main-page-schema/main-page-schema';
import styles from './PartnersBlockForm.module.scss';

interface PartnersBlockFormProps {
    initialData: MainPage | null;
}

export const PartnersBlockForm = ({ initialData }: PartnersBlockFormProps) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty, isValid, errors },
    } = useForm<PartnersBlockFormValues>({
        mode: 'onChange',
        resolver: yupResolver(PartnersBlockValidationSchema),
        defaultValues: PARTNERS_BLOCK_FORM_DEFAULTS,
    });

    useEffect(() => {
        reset({
            title: initialData?.mainPartners?.title || '',
            description: initialData?.mainPartners?.description || '',
        });
    }, [initialData, reset]);

    const onSubmit = () => {
        // API integration is intentionally deferred for the display-only phase.
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
                                id="partners-block-title"
                                name={name}
                                label={MAIN_PAGE_TEXT.BLOCKS.PARTNERS.TITLE_LABEL}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={errors.title?.message}
                                maxLength={MAIN_PAGE_VALIDATION.partnersBlock.title.max}
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
                                id="partners-block-description"
                                name={name}
                                label={MAIN_PAGE_TEXT.BLOCKS.PARTNERS.DESCRIPTION_LABEL}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={errors.description?.message}
                                maxLength={MAIN_PAGE_VALIDATION.partnersBlock.description.max}
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
