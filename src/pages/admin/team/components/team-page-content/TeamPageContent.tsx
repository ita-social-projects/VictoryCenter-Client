import React, {useState} from "react";
import {StatusFilter, TeamPageToolbar} from "../team-page-toolbar/TeamPageToolbar";
import {MembersList} from "../members-list/MembersList";

export const TeamPageContent = () => {
    const [searchByNameQuery, setSearchByNameQuery] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("Усі");
    const [autocompleteValues, setAutocompleteValues] = useState<string[]>([]);
    const handleSearchQueryByName = (query: string) => {
        console.log(query)
        setSearchByNameQuery(query);
    };

    const onCategoryFilterChange = (category: StatusFilter) => {
        setStatusFilter(category);
    };

    const handleAutocompleteValuesChange = (autocompleteValues: string[]) => {
        setAutocompleteValues(autocompleteValues);
    }

    return (
        <div className='wrapper'>
            <TeamPageToolbar autocompleteValues={autocompleteValues} onSearchQueryChange={handleSearchQueryByName} onStatusFilterChange={onCategoryFilterChange}></TeamPageToolbar>
            <MembersList searchByNameQuery={searchByNameQuery} statusFilter={statusFilter} onAutocompleteValuesChange={handleAutocompleteValuesChange}></MembersList>
        </div>
    );
}
