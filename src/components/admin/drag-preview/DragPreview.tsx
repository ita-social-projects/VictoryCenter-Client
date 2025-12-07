import { DragPreviewModel } from '@app-types/admin/common';
import { ReactComponent as DragIcon } from '@assets/icons/dragger.svg';
import React from 'react';
import './DragPreview.scss';

export interface DragPreviewProps<TEntity> {
    entity: TEntity;
    dragPreview: DragPreviewModel<TEntity>;
    renderEntityComponent: (entity: TEntity) => React.ReactNode;
}

export const DragPreview = <TEntity,>({ dragPreview, entity, renderEntityComponent }: DragPreviewProps<TEntity>) => {
    if (!dragPreview.visible || !dragPreview.item) return <></>;

    return (
        <div
            className="drag-preview"
            aria-hidden={true}
            style={{
                left: dragPreview.x - 45,
                top: dragPreview.y - 55,
            }}
        >
            <div className="drag-preview-wrapper">
                <div className="dragger">
                    <DragIcon />
                </div>
                <div className="item-data">{renderEntityComponent(entity)}</div>
            </div>
        </div>
    );
};
