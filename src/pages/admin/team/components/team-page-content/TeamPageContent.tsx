import React, {useCallback, useState} from "react";
import {StatusFilter, TeamPageToolbar} from "../team-page-toolbar/TeamPageToolbar";
import {MembersList} from "../members-list/MembersList";

export const TeamPageContent = () => {
    const [searchByNameQuery, setSearchByNameQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("Усі");
    const [autocompleteValues, setAutocompleteValues] = useState<string[]>([]);

    const handleSearchQueryByName = useCallback((query: string) => {
        setSearchByNameQuery(query);
    }, []);

    const onCategoryFilterChange = useCallback((category: StatusFilter) => {
        setStatusFilter(category);
    }, []);

    const handleAutocompleteValuesChange = useCallback((values: string[]) => {
        setAutocompleteValues(values);
    }, []);

    return (
        <div className='wrapper'>
            <TeamPageToolbar
                autocompleteValues={autocompleteValues}
                onSearchQueryChange={handleSearchQueryByName}
                onStatusFilterChange={onCategoryFilterChange}
            />
            <MembersList
                searchByNameQuery={searchByNameQuery}
                statusFilter={statusFilter}
                onAutocompleteValuesChange={handleAutocompleteValuesChange}
            />
        </div>
    );
}

