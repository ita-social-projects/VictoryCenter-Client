import { DragPreviewModel } from '../../../types/admin/common';
import DragIcon from '../../../assets/icons/dragger.svg';
import React from 'react';
import './DragPreview.scss';
export interface DragPreviewProps<TEntity> {
    entity: TEntity;
    dragPreview: DragPreviewModel<TEntity>;
    keySelector: (entity: TEntity) => number | string;
    renderEntityComponent: (entity: TEntity) => React.ReactNode;
    dragAltText: string;
}
export const DragPreview = <TEntity,>({
    dragPreview,
    keySelector,
    entity,
    renderEntityComponent,
    dragAltText,
}: DragPreviewProps<TEntity>) => {
    if (!dragPreview.visible || !dragPreview.item) return <></>;

    return (
        <div
            className="drag-preview"
            style={{
                left: dragPreview.x - 45,
                top: dragPreview.y - 55,
            }}
        >
            <div key={keySelector(entity)} className="drag-preview-wrapper">
                <div className="dragger">
                    <img src={DragIcon} alt={dragAltText} />
                </div>
                {renderEntityComponent(entity)}
            </div>
        </div>
    );
};
