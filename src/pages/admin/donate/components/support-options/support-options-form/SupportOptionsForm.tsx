import { useState } from 'react';
import { Button } from '../../../../../../components/admin/button/Button';
import { SupportOptionsType } from '../../../../../../types/admin/donate';
import { InlineLoader } from '../../../../../../components/common/inline-loader/InlineLoader';
import { ReactComponent as PlusIcon } from '../../../../../../assets/icons/plus.svg';
import stylesSupport from './SupportOptionsForm.module.scss';
import stylesDonate from '../../donate-page-content/DonatePageContent.module.scss';
import { SupportOptionItem } from '../support-option-item/SupportOptionItem';
import NotFoundIcon from '../../../../../../assets/icons/not-found.svg';
import { DONATE_TEXT } from '../../../../../../const/admin/donate';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';

export interface SupportOptionsFormProps {
    supportOptions: SupportOptionsType[];
    isLoading: boolean;
    onCreateOption: (name: string, value: string) => Promise<void>;
    onUpdateOption: (id: number, name: string, value: string) => Promise<void>;
    onDeleteOption: (id: number) => Promise<void>;
}

export const SupportOptionsForm = ({
    supportOptions,
    isLoading,
    onCreateOption,
    onUpdateOption,
    onDeleteOption,
}: SupportOptionsFormProps) => {
    const [isAdding, setIsAdding] = useState(false);

    const handleSaveNewOption = async (name: string, value: string) => {
        await onCreateOption(name, value);
        setIsAdding(false);
    };

    const shouldShowNotFound = supportOptions.length === 0 && !isAdding && !isLoading;
    const shouldShowLoader = isLoading && supportOptions.length === 0 && !isAdding;

    if (shouldShowLoader) {
        return (
            <div className={stylesSupport['support-options-container']}>
                <div className={stylesSupport['support-options-loader']}>
                    <InlineLoader size={3} />
                </div>
            </div>
        );
    }

    return (
        <div className={stylesSupport['support-options-container']}>
            {shouldShowNotFound ? (
                <div
                    className={`${stylesSupport['support-options-form']} ${stylesSupport['not-found']} ${stylesDonate['not-found']} data-testid="support-options-not-found`}
                >
                    <img src={NotFoundIcon} alt={COMMON_TEXT_ADMIN.LIST.NOT_FOUND} />
                    <p>{DONATE_TEXT.SUPPORT_OPTIONS.NOT_FOUND}</p>
                    <Button
                        className={stylesDonate['btn-add']}
                        onClick={() => setIsAdding(true)}
                        buttonStyle="secondary"
                    >
                        {DONATE_TEXT.SUPPORT_OPTIONS.ADD_FIRST}
                        <PlusIcon className="plus-icon" />
                    </Button>
                </div>
            ) : (
                <div className={stylesSupport['support-options-form']}>
                    <div className={`${stylesSupport['support-options-form']} ${stylesSupport['title']}`}>
                        {DONATE_TEXT.SUPPORT_OPTIONS.TITLE}
                    </div>
                    {supportOptions.map((item) => (
                        <SupportOptionItem
                            key={item.id}
                            data={item}
                            onSave={(name, value) => onUpdateOption(item.id, name, value)}
                            onDelete={() => onDeleteOption(item.id)}
                        />
                    ))}

                    {isAdding && (
                        <SupportOptionItem key="new" onSave={handleSaveNewOption} onCancel={() => setIsAdding(false)} />
                    )}

                    <Button
                        className={`${stylesSupport['btn-add']} ${stylesSupport['new']}`}
                        onClick={() => setIsAdding(true)}
                        buttonStyle="primary"
                        disabled={isLoading || isAdding}
                    >
                        {DONATE_TEXT.SUPPORT_OPTIONS.ADD_NEW}
                        <PlusIcon className="plus-icon" />
                    </Button>
                </div>
            )}
        </div>
    );
};
