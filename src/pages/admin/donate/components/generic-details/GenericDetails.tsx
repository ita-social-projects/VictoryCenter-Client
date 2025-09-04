import { useState, useCallback, useRef } from 'react';
import { Button } from '../../../../../components/admin/button/Button';
import NotFoundIcon from '../../../../../assets/icons/not-found.svg';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import './GenericDetails.scss';

export interface BaseFormRef {
    isValid: (showErrors?: boolean) => boolean;
}

export interface BaseFormProps<T> {
    isOpen?: boolean;
    initialData?: T;
    initialMode: 'create' | 'view' | 'edit';
    onSubmit: (data: T) => void;
    onClose: () => void;
    onDelete?: (id: number) => void;
}

export interface GenericDetailsProps<T> {
    items: T[];
    isLoading: boolean;
    className?: string;
    FormComponent: React.ForwardRefExoticComponent<
        React.PropsWithoutRef<BaseFormProps<T>> & React.RefAttributes<BaseFormRef>
    >;
    notFoundText: string;
    addNewText: string;
    createEmptyItem: (data: any) => T;
}

export function GenericDetails<T extends { id?: number }>({
    items: initialItems,
    isLoading,
    className,
    FormComponent,
    notFoundText,
    addNewText,
    createEmptyItem,
}: GenericDetailsProps<T>) {
    const formRef = useRef<BaseFormRef>(null);
    const [items, setItems] = useState<T[]>(initialItems);
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);

    const handleDelete = (id?: number) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const handleAdd = () => {
        setIsAddFormVisible(true);
    };

    const handleClose = () => {
        setIsAddFormVisible(false);
    };

    const handleSubmit = useCallback(
        async (data: T) => {
            const currentIsValid = formRef.current?.isValid(false) || false;
            if (!currentIsValid) return;

            const newItem = createEmptyItem(data);

            await new Promise((res) => setTimeout(res, 300));
            setItems((prev) => [...prev, newItem]);
            setIsAddFormVisible(false);
        },
        [createEmptyItem],
    );

    return (
        <div className={`donate-page-credits ${className ?? ''}`}>
            {items.length > 0 && (
                <>
                    {items.map((item) => (
                        <div className="donate-page-credits-item" key={item.id}>
                            <FormComponent
                                ref={formRef}
                                initialData={item}
                                initialMode="view"
                                onSubmit={(updated) =>
                                    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, ...updated } : i)))
                                }
                                onClose={() => handleDelete(item?.id)}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}
                    {!isAddFormVisible && (
                        <Button className="donate-page-credits-btn-add-new" onClick={handleAdd} buttonStyle="primary">
                            {addNewText}
                        </Button>
                    )}
                </>
            )}

            {items.length === 0 && !isLoading && !isAddFormVisible && (
                <div className="donate-page-credits not-found">
                    <img src={NotFoundIcon} alt={COMMON_TEXT_ADMIN.ALT.NOT_FOUND} />
                    <p>{notFoundText}</p>
                    <Button className="donate-page-credits btn-add" onClick={handleAdd} buttonStyle="secondary">
                        {addNewText}
                    </Button>
                </div>
            )}

            {isAddFormVisible && (
                <FormComponent ref={formRef} onSubmit={handleSubmit} onClose={handleClose} initialMode="create" />
            )}
        </div>
    );
}
