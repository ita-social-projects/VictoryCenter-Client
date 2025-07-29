import React, { useCallback, useState } from 'react';
import { MembersList } from '../members-list/MembersList';
import { MemberFormValues } from '../member-form/MemberForm';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { TeamPageToolbar } from '../team-page-toolbar/TeamPageToolbar';
import { StatusFilter } from '../../../../../types/common';
import { TeamMembersApi } from '../../../../../services/api/admin/team/team-members/team-members-api';

export const TeamPageContent = () => {
    const [searchByNameQuery, setSearchByNameQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('Усі');
    const [autocompleteValues, setAutocompleteValues] = useState<string[]>([]);
    const [refetchKey, setRefetchKey] = useState(0);

    const [error, setError] = useState<string | null>(null);

    const client = useAdminClient();

    const handleSearchQueryByName = useCallback((query: string) => {
        setSearchByNameQuery(query);
    }, []);

    const onCategoryFilterChange = useCallback((category: StatusFilter) => {
        setStatusFilter(category);
    }, []);

    const handleAutocompleteValuesChange = useCallback((values: string[]) => {
        setAutocompleteValues(values);
    }, []);

    const handleAddMember = async (member: MemberFormValues) => {
        setError(null);
        try {
            await TeamMembersApi.postPublished(client, member);
            setRefetchKey((prev) => prev + 1);
        } catch (err) {
            setError('Не вдалося опублікувати учасника. Спробуйте ще раз.');
        }
    };

    const handleSaveDraft = async (member: MemberFormValues) => {
        setError(null);
        try {
            await TeamMembersApi.postDraft(client, member);
            setRefetchKey((prev) => prev + 1);
        } catch (err) {
            setError('Не вдалося зберегти чернетку. Спробуйте ще раз.');
        }
    };

    return (
        <div className="wrapper">
            <TeamPageToolbar
                autocompleteValues={autocompleteValues}
                onSearchQueryChange={handleSearchQueryByName}
                onStatusFilterChange={onCategoryFilterChange}
                onMemberPublish={handleAddMember}
                onMemberSaveDraft={handleSaveDraft}
                onError={setError}
            />
            {error && (
                <div
                    className="error-message"
                    role="alert"
                    style={{ color: 'red', marginBottom: '1rem', marginLeft: '3rem' }}
                >
                    {error}
                </div>
            )}
            <MembersList
                searchByNameQuery={searchByNameQuery}
                statusFilter={statusFilter}
                onAutocompleteValuesChange={handleAutocompleteValuesChange}
                refetchTrigger={refetchKey}
                onError={setError}
            />
        </div>
    );
};
