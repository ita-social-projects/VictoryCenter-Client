import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ProgramListRef, ProgramsList } from '../programs-list/ProgramsList';
import { Program } from '../../../../../types/ProgramAdminPage';
import { VisibilityStatus } from '../../../../../types/Common';
import ProgramsPageToolbar from '../programs-page-toolbar/ProgramsPageToolbar';
import AddProgramModal from '../program-modals/AddProgramModal';
import EditProgramModal from '../program-modals/EditProgramModal';
import DeleteProgramModal from '../program-modals/DeleteProgramModal';
import '../program-form/program-form.scss';

export const ProgramsPageContent = () => {
    const [searchByNameTerm, setSearchByNameTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [autocompleteValues] = useState<string[]>([]);
    const [isDeleteProgramModalOpen, setIsDeleteProgramModalOpen] = useState(false);
    const [isEditProgramModalOpen, setIsEditProgramModalOpen] = useState(false);
    const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);
    const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
    const [programToEdit, setProgramToEdit] = useState<Program | null>(null);

    const programListRef = useRef<ProgramListRef>(null);

    useEffect(() => {
        // fetch autocomplete values
    }, [searchByNameTerm]);

    const handleSearchQueryByName = useCallback((query: string) => {
        setSearchByNameTerm(query);
    }, []);

    const onStatusFilterChange = useCallback((status: VisibilityStatus | undefined) => {
        setStatusFilter(status);
    }, []);

    const onAddStarted = () => {
        setIsAddProgramModalOpen(true);
    };

    const onDeleteStarted = (program: Program) => {
        setProgramToDelete(program);
        setIsDeleteProgramModalOpen(true);
    };

    const onEditStarted = (program: Program) => {
        setProgramToEdit(program);
        setIsEditProgramModalOpen(true);
    };

    const handleAddProgram = (program: Program) => {
        programListRef.current?.addProgram(program);
    };

    const handleEditProgram = (program: Program) => {
        programListRef.current?.editProgram(program);
    };

    const handleDeleteProgram = (program: Program) => {
        programListRef.current?.deleteProgram(program);
    };

    return (
        <div className="wrapper" data-testid="programs-page-content">
            <AddProgramModal
                onAddProgram={handleAddProgram}
                onClose={() => setIsAddProgramModalOpen(false)}
                isOpen={isAddProgramModalOpen}
            />

            <EditProgramModal
                programToEdit={programToEdit}
                onEditProgram={handleEditProgram}
                onClose={() => setIsEditProgramModalOpen(false)}
                isOpen={isEditProgramModalOpen}
            />

            <DeleteProgramModal
                programToDelete={programToDelete}
                onDeleteProgram={handleDeleteProgram}
                onClose={() => setIsDeleteProgramModalOpen(false)}
                isOpen={isDeleteProgramModalOpen}
            />

            <ProgramsPageToolbar
                autocompleteValues={autocompleteValues}
                onSearchQueryChange={handleSearchQueryByName}
                onStatusFilterChange={onStatusFilterChange}
                onAddProgram={onAddStarted}
            />
            <ProgramsList
                ref={programListRef}
                searchByStatus={statusFilter}
                onEditProgram={onEditStarted}
                onDeleteProgram={onDeleteStarted}
            />
        </div>
    );
};
