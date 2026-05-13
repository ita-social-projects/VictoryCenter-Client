import { Button } from '@/components/admin/button/Button';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { MainPageFormValues } from '@/types/admin/main-page';
import { Controller, useFormContext } from 'react-hook-form';

import styles from './PartnersBlockForm.module.scss';

interface PartnersBlockFormProps {
    isPublishDisabled: boolean;
    onPublish: () => void;
}

export const PartnersBlockForm = ({ isPublishDisabled, onPublish }: PartnersBlockFormProps) => {
    const {
        control,
        formState: { errors },
    } = useFormContext<MainPageFormValues>();

    return (
        <div className={styles.form}>
            <div className={styles.content}>
                <div className={styles.column}>
                    <Controller
                        name="partnersTitleUa"
                        control={control}
                        render={({ field: { onChange, value, onBlur, name } }) => (
                            <InputWithCharacterLimitGroup
                                id="partners-block-title"
                                name={name}
                                label={MAIN_PAGE_TEXT.BLOCKS.PARTNERS.TITLE_LABEL}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={errors.partnersTitleUa?.message}
                                maxLength={MAIN_PAGE_VALIDATION.partnersBlock.title.max}
                                isRequired={true}
                            />
                        )}
                    />
                </div>

                <div className={styles.column}>
                    <Controller
                        name="partnersDescriptionUa"
                        control={control}
                        render={({ field: { onChange, value, onBlur, name } }) => (
                            <TextAreaWithCharacterLimitGroup
                                id="partners-block-description"
                                name={name}
                                label={MAIN_PAGE_TEXT.BLOCKS.PARTNERS.DESCRIPTION_LABEL}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={errors.partnersDescriptionUa?.message}
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
                    type="button"
                    buttonStyle="primary"
                    disabled={isPublishDisabled}
                    className={styles['publish-button']}
                    onClick={onPublish}
                >
                    {MAIN_PAGE_TEXT.BUTTONS.PUBLISH}
                </Button>
            </div>
        </div>
    );
};
