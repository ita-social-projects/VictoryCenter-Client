import './MembersList.scss';
import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from '../../../../../components/common/modal/Modal';
import { MemberDragPreview } from '../member-drag-preview/MemberDragPreview';
import { MembersListItem } from '../members-list-item/MembersListItem';
import NotFoundIcon from '../../../../../assets/icons/not-found.svg';
import { Button } from '../../../../../components/common/button/Button';
import LoaderIcon from '../../../../../assets/icons/load.svg';
import ArrowUpIcon from '../../../../../assets/icons/arrow-up.svg';
import { MemberForm, MemberFormValues } from '../member-form/MemberForm';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { mapStatusFilterToStatus, StatusFilter } from '../../../../../types/common';
import { TeamCategory, TeamMember } from '../../../../../types/admin/team-members';
import { DragPreviewModel } from '../../../../../types/admin/common';
import { TeamCategoriesApi } from '../../../../../services/api/admin/team/team-сategories/team-categories-api';
import { TeamMembersApi } from '../../../../../services/api/admin/team/team-members/team-members-api';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';

export type MembersListProps = {
    searchByNameQuery: string | null;
    statusFilter: StatusFilter;
    onAutocompleteValuesChange: (autocompleteValue: string[]) => void;
    refetchTrigger?: number;
    onError?: (msg: string | null) => void;
};

const currentTabKey = 'currentTab';

export const MembersList = ({
    searchByNameQuery,
    statusFilter,
    onAutocompleteValuesChange,
    refetchTrigger,
    onError,
}: MembersListProps) => {
    const [pageSize, setPageSize] = useState(0);
    const [totalPages, setTotalPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [teamMemberToDelete, setTeamMemberToDelete] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [category, setCategory] = useState<TeamCategory | null>(() => {
        const savedName = localStorage.getItem(currentTabKey);
        return savedName as TeamCategory | null;
    });
    const [teamCategories, setTeamCategories] = useState<TeamCategory[]>([]);
    const [isDeleteTeamMemberModalOpen, setIsDeleteTeamMemberModalOpen] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragPreview, setDragPreview] = useState<DragPreviewModel<TeamMember>>({
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
    const categoryRef = useRef<TeamCategory | null>(category);

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
            const calculatedPageSize = Math.floor(memberListRef.current.clientHeight / 120) + 1;
            setPageSize(calculatedPageSize);
        } else {
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            const categories = await TeamCategoriesApi.getAll(client);
            setTeamCategories(categories);

            const savedRaw = localStorage.getItem(currentTabKey);

            if (savedRaw) {
                try {
                    let saved = JSON.parse(savedRaw);
                    let ss;
                    if (saved.id === undefined) {
                        ss = JSON.parse(saved);
                    }
                    saved = ss;
                    const match = categories.find((c) => c.id === saved.id);
                    if (match) {
                        setCategory(match);
                    } else {
                        setCategory(categories[0]);
                    }
                } catch (err) {
                    setCategory(categories[0]);
                }
            } else {
                setCategory(categories[0]);
            }
        };

        fetchCategories();
    }, [client]);

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
            if (!currentCategory || isFetchingRef.current) {
                return;
            }
            if (!reset && totalPagesRef.current && currentPageRef.current > totalPagesRef.current) {
                setIsMembersLoading(false);
                isFetchingRef.current = false;
                return;
            }

            isFetchingRef.current = true;
            setIsMembersLoading(true);

            const pageToFetch = reset ? 1 : currentPageRef.current;

            let newMembers = [] as TeamMember[];
            try {
                const response = await TeamMembersApi.getAll(
                    client,
                    currentCategory.id,
                    mapStatusFilterToStatus(statusFilter),
                    (pageToFetch - 1) * pageSize,
                    pageToFetch * pageSize,
                );
                newMembers = response;
                setTotalCount(response.length);
            } catch (err) {
                onError?.((err as Error).message);
            }
            if (currentSearch) {
                newMembers = newMembers.filter((m) => m.fullName.toLowerCase().includes(currentSearch.toLowerCase()));
            }

            const totalCountOfPages = Math.ceil(totalCount / pageSize);

            setMembers((prev) => {
                const updatedMembers = reset ? [...newMembers] : [...prev, ...newMembers];
                return updatedMembers.filter((m, index, self) => {
                    return index === self.findIndex((t) => t.id === m.id);
                });
            });
            setCurrentPage((prev) => (reset ? 2 : prev + 1));
            if (totalPagesRef.current === null || reset) {
                setTotalPages(totalCountOfPages);
            }

            setIsMembersLoading(false);
            isFetchingRef.current = false;
        },
        [searchByNameQuery, totalCount, pageSize, client, statusFilter, onError],
    );

    useEffect(() => {
        setMembers([]);
        setCurrentPage(1);
        setTotalPages(null);
        isFetchingRef.current = false;
        loadMembers(true);
        // TODO remove eslint disable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, searchByNameQuery, statusFilter, pageSize, refetchTrigger]);

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
        try {
            if (draggedIndex === null || draggedIndex === index) return;

            const updatedMembers = [...members];
            const draggedItem = updatedMembers[draggedIndex];
            updatedMembers.splice(draggedIndex, 1);
            updatedMembers.splice(index, 0, draggedItem);

            setMembers(updatedMembers);
            setDraggedIndex(null);

            const orderedIds = updatedMembers.map((m) => m.id);
            const categoryId = category?.id ?? 0;

            await TeamMembersApi.reorder(client, categoryId, orderedIds);
        } catch (err) {
            onError?.((err as Error).message);
        }
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
        } catch (err) {
            onError?.((err as Error).message);
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
            localStorage.setItem(currentTabKey, JSON.stringify(category));
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
                img: null,
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
        try {
            if (memberToEdit && memberIdToEdit != null) {
                await TeamMembersApi.updateDraft(client, memberIdToEdit, memberToEdit);
                await loadMembers(true);
            }
        } catch (err) {
            onError?.((err as Error).message);
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
            } catch (err) {
                onError?.((err as Error).message);
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
                (memberToEdit.img === null &&
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
                <p>{COMMON_TEXT_ADMIN.LIST.NOT_FOUND}</p>
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
                    {teamCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat)}
                            className={classNames({
                                'members-categories-selected': category?.id === cat.id,
                            })}
                        >
                            {cat.name}
                        </button>
                    ))}
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
                    <div className="members-delete-modal-header">{TEAM_MEMBERS_TEXT.FORM.TITLE.DELETE_MEMBER}</div>
                </Modal.Title>
                <Modal.Content>
                    <></>
                </Modal.Content>
                <Modal.Actions>
                    <div className="members-delete-modal-actions">
                        <Button buttonStyle={'secondary'} onClick={() => setIsDeleteTeamMemberModalOpen(false)}>
                            {COMMON_TEXT_ADMIN.BUTTON.YES}
                        </Button>
                        <Button buttonStyle={'primary'} onClick={handleDeleteMember}>
                            {COMMON_TEXT_ADMIN.BUTTON.NO}
                        </Button>
                    </div>
                </Modal.Actions>
            </Modal>

            {isEditMemberModalOpen && (
                <Modal onClose={handleEditMemberOnClose} isOpen={isEditMemberModalOpen}>
                    <Modal.Title>{TEAM_MEMBERS_TEXT.FORM.TITLE.EDIT_MEMBER}</Modal.Title>
                    <Modal.Content>
                        <MemberForm
                            onValuesChange={(mfv) => setMemberToEdit(mfv)}
                            existingMemberFormValues={memberToEdit}
                            id="edit-member-modal"
                            onSubmit={handleMemberEdit}
                            onError={onError}
                        />
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={handleSaveAsDraft} buttonStyle={'secondary'}>
                            {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT}
                        </Button>
                        <Button form="edit-member-modal" type={'submit'} buttonStyle={'primary'}>
                            {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                        </Button>
                    </Modal.Actions>
                </Modal>
            )}
            <Modal
                isOpen={isConfirmPublishNewMemberModalOpen}
                onClose={() => setIsConfirmPublishNewMemberModalOpen(false)}
            >
                <Modal.Title>{TEAM_MEMBERS_TEXT.QUESTION.PUBLISH_MEMBER}</Modal.Title>
                <Modal.Actions>
                    <Button onClick={handleCancelPublish} buttonStyle={'secondary'}>
                        {COMMON_TEXT_ADMIN.BUTTON.NO}
                    </Button>
                    <Button onClick={handleConfirmPublish} buttonStyle={'primary'}>
                        {COMMON_TEXT_ADMIN.BUTTON.YES}
                    </Button>
                </Modal.Actions>
            </Modal>

            <Modal isOpen={isConfirmCloseModalOpen} onClose={() => setIsConfirmCloseModalOpen(false)}>
                <Modal.Title>{COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}</Modal.Title>
                <Modal.Actions>
                    <Button onClick={() => setIsConfirmCloseModalOpen(false)} buttonStyle={'secondary'}>
                        {COMMON_TEXT_ADMIN.BUTTON.NO}
                    </Button>
                    <Button buttonStyle={'primary'} onClick={handleConfirmClose}>
                        {COMMON_TEXT_ADMIN.BUTTON.YES}
                    </Button>
                </Modal.Actions>
            </Modal>
        </>
    );
};
