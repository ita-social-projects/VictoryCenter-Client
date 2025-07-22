import React, { useCallback, useEffect, useRef, useState } from 'react';
import { categoryMap } from '../../../../../const/admin/team-page';
import { Member, TeamCategory } from '../../../../../types/TeamPage';
import { Modal } from '../../../../../components/common/modal/Modal';
import { MemberDragPreview } from '../member-drag-preview/MemberDragPreview';
import { MembersListItem } from '../members-list-item/MembersListItem';
import NotFoundIcon from '../../../../../assets/icons/not-found.svg';
import { Button } from '../../../../../components/common/button/Button';
import LoaderIcon from '../../../../../assets/icons/load.svg';
import ArrowUpIcon from '../../../../../assets/icons/arrow-up.svg';
import { StatusFilter } from '../team-page-toolbar/TeamPageToolbar';
import { MemberForm, MemberFormValues } from '../member-form/MemberForm';
import './members-list.scss';
import { TeamMembersApi } from '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamMembersApi';
import { useAdminClient } from '../../../../../utils/hooks/use-admin-client/useAdminClient';
import { AxiosInstance } from 'axios';
import {
    TEAM_DELETE_MEMBER,
    TEAM_EDIT_MEMBER,
    TEAM_SAVE_AS_DRAFT,
    TEAM_PUBLISH,
    TEAM_PUBLISH_NEW_MEMBER,
    TEAM_CONFIRM,
    TEAM_CANCEL,
    TEAM_CHANGES_LOST,
    TEAM_CATEGORY_MAIN,
    TEAM_CATEGORY_SUPERVISORY,
    TEAM_CATEGORY_ADVISORS,
    TEAM_NOT_FOUND,
} from '../../../../../const/team';
import classNames from 'classnames';

export type MembersListProps = {
    searchByNameQuery: string | null;
    statusFilter: StatusFilter;
    onAutocompleteValuesChange: (autocompleteValue: string[]) => void;
    refetchTrigger?: number;
};

export type MemberDragPreviewModel = {
    visible: boolean;
    x: number;
    y: number;
    member: Member | null;
};

const currentTabKey = 'currentTab';
export const fetchMembers = async (
    category: string,
    pageSize: number,
    pageNumber: number,
    searchQuery: string = '',
    statusFilter: StatusFilter = 'Усі',
    client: AxiosInstance,
): Promise<{
    newMembers: Member[];
    totalCountOfPages: number;
}> => {
    let filtered = await TeamMembersApi.getAll(client);
    if (category) {
        filtered = filtered.filter((m) => m.category === category);
    }
    if (searchQuery) {
        filtered = filtered.filter((m) => m.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter && statusFilter !== 'Усі') {
        filtered = filtered.filter((m) => m.status === statusFilter);
    }
    const some = (pageNumber - 1) * pageSize;
    return {
        newMembers: filtered.slice(some, some + pageSize),
        totalCountOfPages: Math.ceil(filtered.length / pageSize),
    };
};

export const MembersList = ({ searchByNameQuery, statusFilter, onAutocompleteValuesChange }: MembersListProps) => {
    const [pageSize, setPageSize] = useState(0);
    const [totalPages, setTotalPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [teamMemberToDelete, setTeamMemberToDelete] = useState<string | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [category, setCategory] = useState<TeamCategory>(
        () => (localStorage.getItem(currentTabKey) as TeamCategory) || 'Основна команда',
    );
    const [isDeleteTeamMemberModalOpen, setIsDeleteTeamMemberModalOpen] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragPreview, setDragPreview] = useState<MemberDragPreviewModel>({
        visible: false,
        x: 0,
        y: 0,
        member: null,
    });
    const memberListRef = useRef<HTMLDivElement>(null);
    const [isMembersLoading, setIsMembersLoading] = useState(false);
    const isFetchingRef = useRef(false);
    const [isMoveToTopVisible, setIsMoveToTopVisible] = useState<boolean>(false);

    const [memberIdToEdit, setMemberIdToEdit] = useState<number | null>(null);
    const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState<MemberFormValues | null>(null);

    const [isConfirmPublishNewMemberModalOpen, setIsConfirmPublishNewMemberModalOpen] = useState(false);
    const [isConfirmCloseModalOpen, setIsConfirmCloseModalOpen] = useState(false);

    const currentPageRef = useRef<number>(currentPage);
    const totalPagesRef = useRef<number | null>(totalPages);
    const categoryRef = useRef<TeamCategory | undefined>(category);

    const client = useAdminClient();
    const clientRef = useRef(client);

    useEffect(() => {
        clientRef.current = client;
    }, [client]);

    useEffect(() => {
        currentPageRef.current = currentPage;
    }, [currentPage]);

    useEffect(() => {
        totalPagesRef.current = totalPages;
    }, [totalPages]);

    useEffect(() => {
        categoryRef.current = category;
    }, [category]);

    const updatePageSize = () => {
        if (memberListRef.current) {
            setPageSize(memberListRef.current.clientHeight / 120 + 1);
        }
    };

    useEffect(() => {
        window.addEventListener('resize', updatePageSize);
        return () => window.removeEventListener('resize', updatePageSize);
    }, []);

    useEffect(() => {
        updatePageSize();
    }, [memberListRef]);

    const loadMembers = useCallback(
        async (reset: boolean = false) => {
            const currentCategory = categoryRef.current;
            const currentSearch = searchByNameQuery || '';
            const currentStatus = statusFilter;
            if (!currentCategory || isFetchingRef.current) return;
            if (!reset && totalPagesRef.current && currentPageRef.current > totalPagesRef.current) return;

            isFetchingRef.current = true;
            setIsMembersLoading(true);

            const pageToFetch = reset ? 1 : currentPageRef.current;

            const { newMembers, totalCountOfPages } = await fetchMembers(
                currentCategory,
                pageSize,
                pageToFetch,
                currentSearch,
                currentStatus,
                clientRef.current,
            );

            setMembers((prev) => (reset ? [...newMembers] : [...prev, ...newMembers]));
            setCurrentPage((prev) => (reset ? 2 : prev + 1));
            if (totalPagesRef.current === null || reset) {
                setTotalPages(totalCountOfPages);
            }

            setIsMembersLoading(false);
            isFetchingRef.current = false;
        },
        [searchByNameQuery, statusFilter, pageSize],
    );

    useEffect(() => {
        setMembers([]);
        setCurrentPage(1);
        setTotalPages(null);
        isFetchingRef.current = false;
        loadMembers(true);
    }, [category, searchByNameQuery, statusFilter, loadMembers, pageSize]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        setDragPreview({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            member: members[index],
        });

        const dragImage = new Image();
        dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
        e.dataTransfer.setDragImage(dragImage, 0, 0);
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        if (e.clientX !== 0 && e.clientY !== 0) {
            setDragPreview((prev) => ({
                ...prev,
                x: e.clientX,
                y: e.clientY,
            }));
        }
    };

    const handleDragEnd = () => {
        setDragPreview({
            visible: false,
            x: 0,
            y: 0,
            member: null,
        });
        setDraggedIndex(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = async (index: number) => {
        if (draggedIndex === null || draggedIndex === index) return;

        const updatedMembers = [...members];
        const draggedItem = updatedMembers[draggedIndex];
        updatedMembers.splice(draggedIndex, 1);
        updatedMembers.splice(index, 0, draggedItem);

        setMembers(updatedMembers);
        setDraggedIndex(null);

        const orderedIds = updatedMembers.map((m) => m.id);
        const categoryId = categoryMap[category];

        await TeamMembersApi.reorder(client, categoryId, orderedIds);
    };

    const handleOnDeleteMember = (fullName: string) => {
        setTeamMemberToDelete(fullName);
        setIsDeleteTeamMemberModalOpen(true);
    };

    const handleDeleteMember = async () => {
        try {
            const member = members.find((m) => m.fullName === teamMemberToDelete);
            if (!member) {
                return;
            }
            await TeamMembersApi.delete(client, member.id);
            setMembers((prev) => prev.filter((m) => m.id !== member.id));
        } finally {
            setIsDeleteTeamMemberModalOpen(false);
            setTeamMemberToDelete(null);
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (dragPreview.visible) {
                setDragPreview((prev) => ({
                    ...prev,
                    x: e.clientX,
                    y: e.clientY,
                }));
            }
        };

        if (dragPreview.visible) {
            document.addEventListener('mousemove', handleMouseMove);
        }

        if (dragPreview.visible) {
            document.addEventListener('mousemove', handleMouseMove);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
            };
        }

        return () => {};
    }, [dragPreview.visible]);

    useEffect(() => {
        if (category) {
            localStorage.setItem(currentTabKey, category);
        }
    }, [category]);

    useEffect(() => {
        if (isMembersLoading && memberListRef.current) {
            const el = memberListRef.current;
            el.scrollTop = el.scrollHeight;
        }
    }, [isMembersLoading]);

    useEffect(() => {
        if (searchByNameQuery) {
            onAutocompleteValuesChange(
                members
                    .filter((m) => m.fullName.toLowerCase().startsWith(searchByNameQuery.toLowerCase()))
                    .map((m) => m.fullName),
            );
        } else {
            onAutocompleteValuesChange([]);
        }
    }, [members, onAutocompleteValuesChange, searchByNameQuery]);

    const handleOnScroll = () => {
        const el = memberListRef.current;
        if (!el || isMembersLoading) return;

        if (el.scrollTop > 0) {
            setIsMoveToTopVisible(true);
        } else {
            setIsMoveToTopVisible(false);
        }

        const bottomReached = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) <= 5;
        if (bottomReached) {
            loadMembers();
        }
    };

    const moveToTop = () => {
        const el = memberListRef.current;
        if (!el) return;

        el.scrollTop = 0;
    };

    const handleOnEditMember = (id: number) => {
        const memberToEdit = members.filter((m) => m.id === id)[0];
        if (memberToEdit) {
            setMemberToEdit({
                category: memberToEdit.category,
                //TODO: handle with photos
                image: memberToEdit.img,
                fullName: memberToEdit.fullName,
                description: memberToEdit.description,
            });
            setMemberIdToEdit(id);
            setIsEditMemberModalOpen(true);
        }
    };

    const handleMemberEdit = () => {
        setIsConfirmPublishNewMemberModalOpen(true);
    };

    const handleEditMemberOnClose = () => {
        const existingMember = members.filter((m) => m.id === memberIdToEdit)[0];
        //check photos as well
        if (existingMember && memberToEdit) {
            if (
                memberToEdit.description !== existingMember.description ||
                memberToEdit.fullName !== existingMember.fullName ||
                memberToEdit.category !== existingMember.category
            ) {
                setIsConfirmCloseModalOpen(true);
                return;
            }
        }

        setMemberToEdit(null);
        setIsEditMemberModalOpen(false);
    };

    const handleSaveAsDraft = async () => {
        if (memberToEdit && memberIdToEdit != null) {
            await TeamMembersApi.updateDraft(client, memberIdToEdit, memberToEdit);
            await loadMembers(true);
        }
    };

    const handleCancelPublish = () => {
        setIsConfirmPublishNewMemberModalOpen(false);
    };

    const handleConfirmPublish = async () => {
        if (memberToEdit && memberIdToEdit != null) {
            try {
                await TeamMembersApi.updatePublish(client, memberIdToEdit, memberToEdit);
                await loadMembers(true);
            } finally {
                setIsConfirmPublishNewMemberModalOpen(false);
                setIsEditMemberModalOpen(false);
                setMemberToEdit(null);
            }
        }
    };
    const handleConfirmClose = () => {
        if (isEditMemberModalOpen && memberToEdit != null) {
            setIsConfirmCloseModalOpen(false);
            setMemberToEdit(null);
            setIsEditMemberModalOpen(false);
        }

        if (
            isEditMemberModalOpen &&
            (memberToEdit === null ||
                (memberToEdit.image === null &&
                    !memberToEdit.category &&
                    !memberToEdit.fullName &&
                    !memberToEdit.description))
        ) {
            setMemberToEdit(null);
            setIsEditMemberModalOpen(false);
        }
    };

    let content;

    if (members.length > 0) {
        const filteredMembers = members.filter((m) => {
            if (statusFilter === 'Усі') return true;
            return m.status === statusFilter;
        });

        content = filteredMembers.map((m, index) => (
            <MembersListItem
                key={m.id}
                draggedIndex={draggedIndex}
                member={m}
                handleDragOver={handleDragOver}
                handleDragStart={handleDragStart}
                handleDrag={handleDrag}
                handleDragEnd={handleDragEnd}
                handleDrop={handleDrop}
                handleOnDeleteMember={handleOnDeleteMember}
                handleOnEditMember={handleOnEditMember}
                index={index}
            />
        ));
    } else if (!isMembersLoading) {
        content = (
            <div className="members-not-found" data-testid="members-not-found">
                <img src={NotFoundIcon} alt="members-not-found" data-testid="members-not-found-icon" />
                <p>{TEAM_NOT_FOUND}</p>
            </div>
        );
    } else {
        content = null; // or a loading spinner if you want
    }

    return (
        <>
            {dragPreview?.visible && dragPreview?.member ? <MemberDragPreview dragPreview={dragPreview} /> : <></>}

            <div className="members">
                <div
                    data-testid="members-categories"
                    className="members-categories"
                    style={{ pointerEvents: isMembersLoading ? 'none' : 'all' }}
                >
                    <button
                        onClick={() => setCategory(TEAM_CATEGORY_MAIN)}
                        className={classNames({ 'members-categories-selected': category === TEAM_CATEGORY_MAIN })}
                    >
                        {TEAM_CATEGORY_MAIN}
                    </button>
                    <button
                        onClick={() => setCategory(TEAM_CATEGORY_SUPERVISORY)}
                        className={classNames({
                            'members-categories-selected': category === TEAM_CATEGORY_SUPERVISORY,
                        })}
                    >
                        {TEAM_CATEGORY_SUPERVISORY}
                    </button>
                    <button
                        onClick={() => setCategory(TEAM_CATEGORY_ADVISORS)}
                        className={classNames({ 'members-categories-selected': category === TEAM_CATEGORY_ADVISORS })}
                    >
                        {TEAM_CATEGORY_ADVISORS}
                    </button>
                </div>
                <div ref={memberListRef} onScroll={handleOnScroll} data-testid="members-list" className="members-list">
                    {content}
                    {isMembersLoading ? (
                        <div className="members-list-loader" data-testid="members-list-loader">
                            <img src={LoaderIcon} alt="loader-icon" data-testid="members-list-loader-icon" />
                        </div>
                    ) : (
                        <></>
                    )}
                    {isMoveToTopVisible ? (
                        <button onClick={moveToTop} className="members-list-list-to-top">
                            <img src={ArrowUpIcon} alt="arrow-up-icon" data-testid="members-list-list-to-top" />
                        </button>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
            <Modal onClose={() => setIsDeleteTeamMemberModalOpen(false)} isOpen={isDeleteTeamMemberModalOpen}>
                <Modal.Title>
                    <div className="members-delete-modal-header">{TEAM_DELETE_MEMBER}</div>
                </Modal.Title>
                <Modal.Content>
                    <></>
                </Modal.Content>
                <Modal.Actions>
                    <div className="members-delete-modal-actions">
                        <Button buttonStyle={'secondary'} onClick={() => setIsDeleteTeamMemberModalOpen(false)}>
                            {TEAM_CANCEL}
                        </Button>
                        <Button buttonStyle={'primary'} onClick={handleDeleteMember}>
                            {TEAM_CONFIRM}
                        </Button>
                    </div>
                </Modal.Actions>
            </Modal>

            {isEditMemberModalOpen && (
                <Modal onClose={handleEditMemberOnClose} isOpen={isEditMemberModalOpen}>
                    <Modal.Title>{TEAM_EDIT_MEMBER}</Modal.Title>
                    <Modal.Content>
                        <MemberForm
                            onValuesChange={(mfv) => setMemberToEdit(mfv)}
                            existingMemberFormValues={memberToEdit}
                            id="edit-member-modal"
                            onSubmit={handleMemberEdit}
                        />
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={handleSaveAsDraft} buttonStyle={'secondary'}>
                            {TEAM_SAVE_AS_DRAFT}
                        </Button>
                        <Button form="edit-member-modal" type={'submit'} buttonStyle={'primary'}>
                            {TEAM_PUBLISH}
                        </Button>
                    </Modal.Actions>
                </Modal>
            )}
            <Modal
                isOpen={isConfirmPublishNewMemberModalOpen}
                onClose={() => setIsConfirmPublishNewMemberModalOpen(false)}
            >
                <Modal.Title>{TEAM_PUBLISH_NEW_MEMBER}</Modal.Title>
                <Modal.Content>
                    <></>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={handleCancelPublish} buttonStyle={'secondary'}>
                        {TEAM_CANCEL}
                    </Button>
                    <Button onClick={handleConfirmPublish} buttonStyle={'primary'}>
                        {TEAM_CONFIRM}
                    </Button>
                </Modal.Actions>
            </Modal>

            <Modal isOpen={isConfirmCloseModalOpen} onClose={() => setIsConfirmCloseModalOpen(false)}>
                <Modal.Title>{TEAM_CHANGES_LOST}</Modal.Title>
                <Modal.Content>
                    <></>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setIsConfirmCloseModalOpen(false)} buttonStyle={'secondary'}>
                        {TEAM_CANCEL}
                    </Button>
                    <Button buttonStyle={'primary'} onClick={handleConfirmClose}>
                        {TEAM_CONFIRM}
                    </Button>
                </Modal.Actions>
            </Modal>
        </>
    );
};
