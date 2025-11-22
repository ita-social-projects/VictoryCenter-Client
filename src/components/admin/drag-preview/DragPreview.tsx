import { DragPreviewModel } from '../../../types/admin/common';
import { ReactComponent as DragIcon } from '../../../assets/icons/dragger.svg';
import React from 'react';
import styles from './DragPreview.module.scss';

export interface DragPreviewProps<TEntity> {
    entity: TEntity;
    dragPreview: DragPreviewModel<TEntity>;
    renderEntityComponent: (entity: TEntity) => React.ReactNode;
}

export const DragPreview = <TEntity,>({ dragPreview, entity, renderEntityComponent }: DragPreviewProps<TEntity>) => {
    if (!dragPreview.visible || !dragPreview.item) return <></>;

    return (
        <div
            className={styles['drag-preview']}
            aria-hidden={true}
            style={{
                left: dragPreview.x - 45,
                top: dragPreview.y - 55,
            }}
        >
            <div className={styles['drag-preview-wrapper']}>
                <div className={styles['dragger']}>
                    <DragIcon />
                </div>
                <div className={styles['item-data']}>{renderEntityComponent(entity)}</div>
            </div>
        </div>
    );
};
