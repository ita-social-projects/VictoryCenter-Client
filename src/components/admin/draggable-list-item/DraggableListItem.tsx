import DragIcon from '../../../assets/icons/dragger.svg';
import React, { useCallback, useRef, useState } from 'react';
import './DraggableListItem.scss';
import { DragPreviewModel } from '../../../types/admin/common';
import { DragPreview } from '../drag-preview/DragPreview';

export interface DraggableListItemProps<TEntity> {
    entity: TEntity;
    id: number | string;
    ariaLabel: string;
    renderEntityComponent: (entity: TEntity) => React.ReactNode;
    entities: TEntity[];
    idSelector: (entity: TEntity) => number | string;
    onEntitiesReordered: (entities: TEntity[]) => void;
}

export const DraggableListItem = <TEntity,>({
    entity,
    id,
    renderEntityComponent,
    ariaLabel,
    entities,
    idSelector,
    onEntitiesReordered,
}: DraggableListItemProps<TEntity>) => {
    const [dragPreview, setDragPreview] = useState<DragPreviewModel<TEntity>>({
        visible: false,
        x: 0,
        y: 0,
        item: null,
    });
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>, id: number | string) => {
            e.preventDefault();

            const draggedId = parseInt(e.dataTransfer.getData('text/plain'), 10);
            if (isNaN(draggedId) || draggedId === id) return;

            const updatedEntities = [...entities];
            const fromIndex = updatedEntities.findIndex((m) => idSelector(m) === draggedId);
            const toIndex = updatedEntities.findIndex((m) => idSelector(m) === id);

            const [draggedItem] = updatedEntities.splice(fromIndex, 1);
            updatedEntities.splice(toIndex, 0, draggedItem);

            onEntitiesReordered(updatedEntities);
        },
        [entities, idSelector, onEntitiesReordered],
    );

    const handleDragEnd = () => {
        setDragPreview({
            visible: false,
            x: 0,
            y: 0,
            item: null,
        });
    };

    const handleDragStart = useCallback(
        (e: React.DragEvent<HTMLDivElement>, id: number | string) => {
            const entity = entities.find((x) => idSelector(x) === id);
            if (!entity) return;

            e.dataTransfer.setData('text/plain', id.toString());

            setDragPreview({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                item: entity,
            });

            const dragImage = new Image();
            dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
            e.dataTransfer.setDragImage(dragImage, 0, 0);
        },
        [entities, idSelector],
    );

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        if (e.clientX !== 0 && e.clientY !== 0) {
            setDragPreview((prev) => ({
                ...prev,
                x: e.clientX,
                y: e.clientY,
            }));
        }
    };

    return (
        <>
            <DragPreview
                entity={entity}
                dragPreview={dragPreview}
                keySelector={idSelector}
                renderEntityComponent={renderEntityComponent}
                dragAltText={ariaLabel}
            ></DragPreview>
            <div
                className={'draggable-item-wrapper'}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, id)}
                onDragEnd={handleDragEnd}
                key={id}
            >
                <div
                    className="dragger"
                    draggable
                    onDragStart={(e) => handleDragStart(e, id)}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    role={'button'}
                    aria-label={ariaLabel}
                    tabIndex={0}
                >
                    <img src={DragIcon} alt={ariaLabel} />
                </div>
                {renderEntityComponent(entity)}
            </div>
        </>
    );
};
