import { useState } from 'react';
import { Button } from '../../../../../components/admin/button/Button';
import { SupportOptionsType } from '../../../../../types/admin/donate';
import './SupportOptionsForm.scss';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { SupportOption } from './SupportOption';

export interface SupportOptionsFormProps {
    initialData?: SupportOptionsType[];
    onClose?: () => void;
}

export const SupportOptionsForm = ({ initialData = [], onClose }: SupportOptionsFormProps) => {
    const [items, setItems] = useState<SupportOptionsType[]>(initialData);
    const [isAddFormVisible, setIsAddFormVisible] = useState(items.length === 0);

    const handleAddOption = () => {
        setIsAddFormVisible(true);
    };

    const handleSaveOption = (item: SupportOptionsType) => {
        setItems((prev) => {
            const exists = prev.find((i) => i.id === item.id);
            if (exists) {
                return prev.map((i) => (i.id === item.id ? item : i));
            }
            return [...prev, item];
        });
        setIsAddFormVisible(false);
    };

    const handleDeleteOption = (id: number) => {
        setItems((prev) => {
            return prev.filter((i) => i.id !== id);
        });
    };

    const handleCancelOption = () => {
        setIsAddFormVisible(false);
    };

    if (!isAddFormVisible && items.length === 0) {
        onClose?.();
    }

    return (
        <div className="support-options-form">
            <div className="support-options-form-title">Інші варіанти підтримки</div>
            {items.length > 0 &&
                items.map((item) => (
                    <div className="donate-page-support-options-item" key={item.id}>
                        <SupportOption data={item} onSave={handleSaveOption} onDelete={handleDeleteOption} />
                    </div>
                ))}

            {isAddFormVisible && <SupportOption onSave={handleSaveOption} onCancel={handleCancelOption} />}

            <Button className="support-options-form-btn-add" onClick={handleAddOption} buttonStyle="primary">
                {COMMON_TEXT_ADMIN.DONATE.SUPPORT_OPTIONS.ADD_NEW}
            </Button>
        </div>
    );
};
