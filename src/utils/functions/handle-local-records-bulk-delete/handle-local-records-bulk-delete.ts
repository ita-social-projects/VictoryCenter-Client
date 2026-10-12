import { isTempId } from '@/utils/functions/reports-records-temp-ids/reports-records-temp-ids';

export const handleLocalRecordsBulkDelete = ({
    selectedRecordIds,
    setSelectedRecordIds,
    setDeletedRecordIds,
    setUpdatedRecordIds,
    setIsBulkDeleteModalOpen,
    onDataChange,
}: {
    selectedRecordIds: number[];
    setSelectedRecordIds: React.Dispatch<React.SetStateAction<number[]>>;
    setDeletedRecordIds: React.Dispatch<React.SetStateAction<number[]>>;
    setUpdatedRecordIds: React.Dispatch<React.SetStateAction<number[]>>;
    setIsBulkDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onDataChange?: () => void;
}) => {
    const realIdsToDelete = selectedRecordIds.filter((id) => !isTempId(id));

    if (realIdsToDelete.length > 0) {
        setDeletedRecordIds((prev) => {
            const newIds = realIdsToDelete.filter((id) => !prev.includes(id));
            return [...prev, ...newIds];
        });

        setUpdatedRecordIds((prev) => prev.filter((id) => !realIdsToDelete.includes(id)));
    }
    onDataChange?.();
    setSelectedRecordIds([]);
    setIsBulkDeleteModalOpen(false);
};
