import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ProgramListRef, ProgramsList } from '../programs-list/ProgramsList';
import { Program } from '../../../../../types/ProgramAdminPage';
import { VisibilityStatus } from '../../../../../types/Common';
import { ProgramsPageToolbar } from '../programs-page-toolbar/ProgramsPageToolbar';
import DeleteProgramModal from '../program-modals/DeleteProgramModal';
import '../program-form/program-form.scss';
import { ProgramModal } from '../program-modals/ProgramModal';

export const ProgramsPageContent = () => {
    const [searchByNameTerm, setSearchByNameTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [autocompleteValues] = useState<string[]>([]);
    const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);
    const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
    const [programToEdit, setProgramToEdit] = useState<Program | null>(null);

    const programListRef = useRef<ProgramListRef>(null);

    useEffect(() => {
        // fetch autocomplete values
        // finish when integrating search with backend
    }, [searchByNameTerm]);

    const handleSearchQueryByName = useCallback((query: string) => {
        setSearchByNameTerm(query);
    }, []);

    const onStatusFilterChange = useCallback((status: VisibilityStatus | undefined) => {
        setStatusFilter(status);
    }, []);

    const handleAddStarted = () => {
        setIsAddProgramModalOpen(true);
    };

    const handleDeleteStarted = (program: Program) => {
        setProgramToDelete(program);
    };

    const handleEditStarted = (program: Program) => {
        setProgramToEdit(program);
    };

    const handleAddProgram = useCallback((program: Program) => {
        programListRef.current?.addProgram(program);
    }, []);

    const handleEditProgram = useCallback((program: Program) => {
        programListRef.current?.editProgram(program);
    }, []);

    const handleDeleteProgram = useCallback((program: Program) => {
        programListRef.current?.deleteProgram(program);
    }, []);

    return (
        <div className="wrapper" data-testid="programs-page-content">
            <ProgramModal
                mode="add"
                isOpen={isAddProgramModalOpen}
                onClose={() => setIsAddProgramModalOpen(false)}
                onAddProgram={handleAddProgram}
            />

            <ProgramModal
                mode="edit"
                isOpen={!!programToEdit}
                onClose={() => setProgramToEdit(null)}
                programToEdit={programToEdit!!}
                onEditProgram={handleEditProgram}
            />

            <DeleteProgramModal
                programToDelete={programToDelete}
                onDeleteProgram={handleDeleteProgram}
                onClose={() => setProgramToDelete(null)}
                isOpen={!!programToDelete}
            />

            <ProgramsPageToolbar
                autocompleteValues={autocompleteValues}
                onSearchQueryChange={handleSearchQueryByName}
                onStatusFilterChange={onStatusFilterChange}
                onAddProgram={handleAddStarted}
            />
            <ProgramsList
                ref={programListRef}
                searchByStatus={statusFilter}
                onEditProgram={handleEditStarted}
                onDeleteProgram={handleDeleteStarted}
            />
        </div>
    );
};
