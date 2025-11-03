import { useState } from 'react';
import { Button } from '../../../../../../components/admin/button/Button';
import { SupportOptionsType } from '../../../../../../types/admin/donate';
import { InlineLoader } from '../../../../../../components/common/inline-loader/InlineLoader';
import { ReactComponent as PlusIcon } from '../../../../../../assets/icons/plus.svg';
import './SupportOptionsForm.scss';
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
            <div className="support-options-container">
                <div className="support-options-loader">
                    <InlineLoader size={3} />
                </div>
            </div>
        );
    }

    return (
        <div className="support-options-container">
            {shouldShowNotFound ? (
                <div className="support-options-form not-found" data-testid="support-options-not-found">
                    <img src={NotFoundIcon} alt={COMMON_TEXT_ADMIN.LIST.NOT_FOUND} />
                    <p>{DONATE_TEXT.SUPPORT_OPTIONS.NOT_FOUND}</p>
                    <Button className="btn-add" onClick={() => setIsAdding(true)} buttonStyle="secondary">
                        {DONATE_TEXT.SUPPORT_OPTIONS.ADD_FIRST}
                        <PlusIcon />
                    </Button>
                </div>
            ) : (
                <div className="support-options-form">
                    <div className="support-options-form title">{DONATE_TEXT.SUPPORT_OPTIONS.TITLE}</div>
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

                    {!isAdding && (
                        <Button
                            className="btn-add new"
                            onClick={() => setIsAdding(true)}
                            buttonStyle="primary"
                            disabled={isLoading}
                        >
                            {DONATE_TEXT.SUPPORT_OPTIONS.ADD_NEW}
                            <PlusIcon />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};
