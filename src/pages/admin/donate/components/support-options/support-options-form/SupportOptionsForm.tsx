import { useEffect, useState } from 'react';
import { Button } from '../../../../../../components/admin/button/Button';
import { SupportOptionsType } from '../../../../../../types/admin/donate';
import './SupportOptionsForm.scss';
import { SupportOptionItem } from '../support-option-item/SupportOptionItem';
import NotFoundIcon from '../../../../../../assets/icons/not-found.svg';
import { DONATE_TEXT } from '../../../../../../const/admin/donate';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';

export interface SupportOptionsFormProps {
    initialData?: SupportOptionsType[];
    onChangeItems?: (newItems: SupportOptionsType[]) => void;
}

export const SupportOptionsForm = ({ initialData = [], onChangeItems }: SupportOptionsFormProps) => {
    const [items, setItems] = useState<SupportOptionsType[]>(initialData);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        setItems(initialData);
        setIsAdding(false);
    }, [initialData]);

    const handleSaveOption = (item: SupportOptionsType) => {
        setItems((prev) => {
            const exists = prev.find((i) => i.id === item.id);
            const newItems = exists ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item];
            onChangeItems?.(newItems);
            return newItems;
        });
        setIsAdding(false);
    };

    const handleDeleteOption = (id: number) => {
        setItems((prev) => {
            const newItems = prev.filter((i) => i.id !== id);
            onChangeItems?.(newItems);
            return newItems;
        });
    };

    const handleAddOption = () => setIsAdding(true);

    const shouldShowNotFound = items.length === 0 && !isAdding;

    return (
        <>
            {shouldShowNotFound ? (
                <div className="support-options-form not-found" data-testid="support-options-not-found">
                    <img src={NotFoundIcon} alt={COMMON_TEXT_ADMIN.ALT.NOT_FOUND} />
                    <p>{DONATE_TEXT.SUPPORT_OPTIONS.NOT_FOUND}</p>
                    <Button className="btn-add" onClick={handleAddOption} buttonStyle="secondary">
                        {DONATE_TEXT.SUPPORT_OPTIONS.ADD_FIRST}
                    </Button>
                </div>
            ) : (
                <div className="support-options-form">
                    <div className="support-options-form title">{DONATE_TEXT.SUPPORT_OPTIONS.TITLE}</div>
                    {items.map((item) => (
                        <SupportOptionItem data={item} onSave={handleSaveOption} onDelete={handleDeleteOption} />
                    ))}

                    {isAdding && <SupportOptionItem onSave={handleSaveOption} onCancel={() => setIsAdding(false)} />}

                    <Button className="btn-add-new" onClick={handleAddOption} buttonStyle="primary">
                        {DONATE_TEXT.SUPPORT_OPTIONS.ADD_NEW}
                    </Button>
                </div>
            )}
        </>
    );
};
