import { Button } from '@/components/admin/button/Button';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { MainPageFormValues } from '@/types/admin/main-page';
import { Control, Controller, FieldPathByValue } from 'react-hook-form';

import styles from './MainPageTextBlockForm.module.scss';

type MainPageTextFieldName = FieldPathByValue<MainPageFormValues, string>;

interface MainPageTextBlockFormProps {
    control: Control<MainPageFormValues>;
    titleName: MainPageTextFieldName;
    descriptionName: MainPageTextFieldName;
    titleId: string;
    descriptionId: string;
    titleLabel: string;
    descriptionLabel: string;
    titleMaxLength: number;
    descriptionMaxLength: number;
    titleError?: string;
    descriptionError?: string;
    isReadOnly: boolean;
    isPublishDisabled: boolean;
    onPublish: () => void;
}

export const MainPageTextBlockForm = ({
    control,
    titleName,
    descriptionName,
    titleId,
    descriptionId,
    titleLabel,
    descriptionLabel,
    titleMaxLength,
    descriptionMaxLength,
    titleError,
    descriptionError,
    isReadOnly,
    isPublishDisabled,
    onPublish,
}: MainPageTextBlockFormProps) => (
    <div className={styles.form}>
        <div className={styles.content}>
            <div className={styles.column}>
                <Controller
                    name={titleName}
                    control={control}
                    render={({ field: { onChange, value, onBlur, name } }) => (
                        <RichTextInputGroup
                            id={titleId}
                            name={name}
                            label={titleLabel}
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={titleError}
                            maxLength={titleMaxLength}
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
                        <RichTextInputGroup
                            id={descriptionId}
                            name={name}
                            label={descriptionLabel}
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={descriptionError}
                            maxLength={descriptionMaxLength}
                            isRequired={true}
                            className={styles['rich-text-custom']}
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
