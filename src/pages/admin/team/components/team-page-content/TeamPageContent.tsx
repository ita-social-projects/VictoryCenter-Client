import React, { useCallback, useState } from 'react';
import { StatusFilter, TeamPageToolbar } from '../team-page-toolbar/TeamPageToolbar';
import { MembersList } from '../members-list/MembersList';
import { MemberFormValues } from '../member-form/MemberForm';
import { TeamMembersApi } from '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamMembersApi';
import { useAdminClient } from '../../../../../utils/hooks/use-admin-client/useAdminClient';
import { ImagesApi } from '../../../../../services/data-fetch/admin-page-data-fetch/image-data-fetch/ImageDataApi';

export const TeamPageContent = () => {
    const [searchByNameQuery, setSearchByNameQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('Усі');
    const [autocompleteValues, setAutocompleteValues] = useState<string[]>([]);
    const [refetchKey, setRefetchKey] = useState(0);

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
        if (member.image != null) {
            member.image = await ImagesApi.post(client, member.image);
        }

        await TeamMembersApi.postPublished(client, member);
        setRefetchKey((prev) => prev + 1);
    };

    const handleSaveDraft = async (member: MemberFormValues) => {
        if (member.image != null) {
            member.image = await ImagesApi.post(client, member.image);
        }

        await TeamMembersApi.postDraft(client, member);
        setRefetchKey((prev) => prev + 1);
    };

    return (
        <div className="wrapper">
            <TeamPageToolbar
                autocompleteValues={autocompleteValues}
                onSearchQueryChange={handleSearchQueryByName}
                onStatusFilterChange={onCategoryFilterChange}
                onMemberPublish={handleAddMember}
                onMemberSaveDraft={handleSaveDraft}
            />
            <MembersList
                searchByNameQuery={searchByNameQuery}
                statusFilter={statusFilter}
                onAutocompleteValuesChange={handleAutocompleteValuesChange}
                refetchTrigger={refetchKey}
            />
        </div>
    );
};
