import React, {useCallback, useEffect, useRef, useState} from "react";
import {TeamCategory} from "../../TeamPage";
import {Modal} from "../../../../../components/common/modal/Modal";
import {MemberDragPreview} from "../member-drag-preview/MemberDragPreview";
import {MembersListItem} from "../members-list-item/MembersListItem";
import NotFoundIcon from "../../../../../assets/icons/not-found.svg";
import {Button} from "../../../../../components/common/button/Button";
import LoaderIcon from "../../../../../assets/icons/load.svg";
import ArrowUpIcon from "../../../../../assets/icons/arrow-up.svg"
import {StatusFilter} from "../team-page-toolbar/TeamPageToolbar";
import {MemberForm, MemberFormValues} from "../member-form/MemberForm";
import "./members-list.scss"
import {mockMembers} from "../../../../../utils/mock-data/admin-page/teamPage";

export type Member = {
    id: number;
    img: string;
    fullName: string;
    description: string;
    status: string;
    category: TeamCategory;
};

export type MembersListProps = {
    searchByNameQuery: string | null;
    statusFilter: StatusFilter;
    onAutocompleteValuesChange: (autocompleteValue: string[]) => void;
};

export type MemberDragPreviewModel = {
    visible: boolean;
    x: number;
    y: number;
    member: Member | null;
};

const currentTabKey = "currentTab";
export const fetchMembers = async (category: string, pageSize: number, pageNumber: number): Promise<{
    newMembers: Member[],
    totalCountOfPages: number
}> => {
    const some = (pageNumber - 1) * pageSize;
    const filteredAndSortedMembers = mockMembers.filter(m => m.category === category).sort((a, b) => a.id - b.id);

    return {
        newMembers: filteredAndSortedMembers.slice(some, some + pageSize),
        totalCountOfPages: Math.ceil(filteredAndSortedMembers.length / pageSize)
    }
};

export const MembersList = ({searchByNameQuery, statusFilter, onAutocompleteValuesChange}: MembersListProps) => {
    const pageSize = 5;
    const [totalPages, setTotalPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [teamMemberToDelete, setTeamMemberToDelete] = useState<string | null>(null);
    const [members, setMembers] = useState<Member[]>(mockMembers);
    const [category, setCategory] = useState<TeamCategory>(() => (localStorage.getItem(currentTabKey) as TeamCategory) || "Основна команда");
    const [isDeleteTeamMemberModalOpen, setIsDeleteTeamMemberModalOpen] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragPreview, setDragPreview] = useState<MemberDragPreviewModel>({
        visible: false,
        x: 0,
        y: 0,
        member: null
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

    useEffect(() => {
        currentPageRef.current = currentPage;
    }, [currentPage]);

    useEffect(() => {
        totalPagesRef.current = totalPages;
    }, [totalPages]);

    useEffect(() => {
        categoryRef.current = category;
    }, [category]);

    const loadMembers = useCallback(async (reset: boolean = false) => {
        const currentCategory = categoryRef.current;
        if (!currentCategory || isFetchingRef.current) return;
        if (!reset && totalPagesRef.current && currentPageRef.current > totalPagesRef.current) return;

        isFetchingRef.current = true;
        setIsMembersLoading(true);

        const pageToFetch = reset ? 1 : currentPageRef.current;

        const {newMembers, totalCountOfPages} = await fetchMembers(currentCategory, pageSize, pageToFetch);

        setMembers(prev => reset ? [...newMembers] : [...prev, ...newMembers]);
        setCurrentPage(prev => reset ? 2 : prev + 1);
        if (totalPagesRef.current === null || reset) {
            setTotalPages(totalCountOfPages);
        }

        setIsMembersLoading(false);
        isFetchingRef.current = false;
    }, []);

    useEffect(() => {
        if (category) {
            setMembers([]);
            setCurrentPage(1);
            isFetchingRef.current = false;
            loadMembers();
        }
    }, [category, loadMembers]);

    const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, index: number) => {
        setDraggedIndex(index);
        setDragPreview({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            member: members[index]
        });

        const dragImage = new Image();
        dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
        e.dataTransfer.setDragImage(dragImage, 0, 0);
    };

    const handleDrag = (e: React.DragEvent<HTMLButtonElement>) => {

        if (e.clientX !== 0 && e.clientY !== 0) {
            setDragPreview(prev => ({
                ...prev,
                x: e.clientX,
                y: e.clientY
            }));
        }
    };

    const handleDragEnd = () => {
        setDragPreview({
            visible: false,
            x: 0,
            y: 0,
            member: null
        });
        setDraggedIndex(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
    };

    const handleDrop = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) return;

        const updatedMembers = [...members];
        const draggedItem = updatedMembers[draggedIndex];
        updatedMembers.splice(draggedIndex, 1);
        updatedMembers.splice(index, 0, draggedItem);

        setMembers(updatedMembers);
        setDraggedIndex(null);
    };

    const handleOnDeleteMember = (fullName: string) => {
        setTeamMemberToDelete(fullName);
        setIsDeleteTeamMemberModalOpen(true);
    };

    const handleDeleteMember = () => {
        setMembers(prev => prev.filter(m => m.fullName !== teamMemberToDelete));
        setIsDeleteTeamMemberModalOpen(false);
        setTeamMemberToDelete(null);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (dragPreview.visible) {
                setDragPreview(prev => ({
                    ...prev,
                    x: e.clientX,
                    y: e.clientY
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
        if (searchByNameQuery) {
            setMembers(mockMembers.filter(m => m.fullName.toLowerCase().includes(searchByNameQuery.toLowerCase())));
        } else {
            setMembers([]);
            setCurrentPage(1);
            setTotalPages(null);
            isFetchingRef.current = false;
            loadMembers(true);
        }
    }, [loadMembers, searchByNameQuery]);

    useEffect(() => {
        if (isMembersLoading && memberListRef.current) {
            const el = memberListRef.current;
            el.scrollTop = el.scrollHeight;
        }
    }, [isMembersLoading]);

    useEffect(() => {
        if (searchByNameQuery) {
            onAutocompleteValuesChange(members.filter(m => m.fullName.toLowerCase().startsWith(searchByNameQuery.toLowerCase())).map(m => m.fullName))
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

        const bottomReached = Math.abs((el.scrollHeight - el.scrollTop) - el.clientHeight) <= 5;
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
        const memberToEdit = members.filter(m => m.id === id)[0];
        if (memberToEdit) {
            setMemberToEdit({
                category: memberToEdit.category,
                //TODO: handle with photos
                img: null,
                fullName: memberToEdit.fullName,
                description: memberToEdit.description
            });
            setMemberIdToEdit(id);
            setIsEditMemberModalOpen(true);
        }
    };

    const handleMemberEdit = () => {
        setIsConfirmPublishNewMemberModalOpen(true);
    };

    const handleEditMemberOnClose = () => {
        const existingMember = members.filter(m => m.id === memberIdToEdit)[0];
        //check photos as well
        if (existingMember && memberToEdit) {
            if (memberToEdit.description !== existingMember.description
                || memberToEdit.fullName !== existingMember.fullName
                || memberToEdit.category !== existingMember.category) {
                setIsConfirmCloseModalOpen(true);
                return;
            }
        }

        setMemberToEdit(null);
        setIsEditMemberModalOpen(false);
    };

    const handleSaveAsDraft = () => {
        if (memberToEdit) {
            setMembers(prev => [...prev.filter(m => m.id !== memberIdToEdit),
                {
                    id: memberIdToEdit!,
                    status: "Чернетка",
                    category: memberToEdit.category,
                    fullName: memberToEdit.fullName,
                    description: memberToEdit.description,
                    img: ""
                }].sort((a, b) => a.id - b.id))
        }
    }

    const handleCancelPublish = () => {
        setIsConfirmPublishNewMemberModalOpen(false);
    };

    const handleConfirmPublish = () => {
        if (memberToEdit) {
            //todo: handle photo
            setMembers(prev => [...prev.filter(m => m.id !== memberIdToEdit),
                {
                    id: memberIdToEdit!,
                    status: "Опубліковано",
                    category: memberToEdit.category,
                    fullName: memberToEdit.fullName,
                    description: memberToEdit.description,
                    img: ""
                }].sort((a, b) => a.id - b.id))
            setIsConfirmPublishNewMemberModalOpen(false);
            setIsEditMemberModalOpen(false);
            setMemberToEdit(null)
        }
    };
    const handleConfirmClose = () => {
        if (isEditMemberModalOpen && memberToEdit != null) {
            setIsConfirmCloseModalOpen(false);
            setMemberToEdit(null);
            setIsEditMemberModalOpen(false)
        }

        if (isEditMemberModalOpen && (memberToEdit === null
            || (memberToEdit.img === null
                && !memberToEdit.category
                && !memberToEdit.fullName
                && !memberToEdit.description))) {
            setMemberToEdit(null);
            setIsEditMemberModalOpen(false)
        }
    };

    let content;

    if (members.length > 0) {
        const filteredMembers = members.filter(m => {
            if (statusFilter === "Усі") return true;
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
                <img
                    src={NotFoundIcon}
                    alt="members-not-found"
                    data-testid="members-not-found-icon"
                />
                <p>Нічого не знайдено</p>
            </div>
        );
    } else {
        content = null; // or a loading spinner if you want
    }

    return (
        <>
            {dragPreview?.visible && dragPreview?.member ? (
                <MemberDragPreview dragPreview={dragPreview}/>
            ) : <></>}

            <div className='members'>
                <div data-testid="members-categories" className='members-categories' style={{"pointerEvents": isMembersLoading ? "none" : "all"}}>
                    <button onClick={() => setCategory("Основна команда")}
                         className={category === "Основна команда" ? 'members-categories-selected' : ''}>Основна
                        команда
                    </button>
                    <button onClick={() => setCategory("Наглядова рада")}
                         className={category === "Наглядова рада" ? 'members-categories-selected' : ''}>Наглядова рада
                    </button>
                    <button onClick={() => setCategory("Радники")}
                         className={category === "Радники" ? 'members-categories-selected' : ''}>Радники
                    </button>
                </div>
                <div ref={memberListRef} onScroll={handleOnScroll} data-testid="members-list" className="members-list">
                    {content}
                    {isMembersLoading
                        ? (<div className='members-list-loader' data-testid='members-list-loader'>
                            <img src={LoaderIcon} alt="loader-icon" data-testid='members-list-loader-icon'/>
                        </div>)
                        : (<></>)}
                    {isMoveToTopVisible ?
                        <button onClick={moveToTop} className='members-list-list-to-top' >
                            <img src={ArrowUpIcon} alt="arrow-up-icon" data-testid="members-list-list-to-top"/>
                        </button> : <></>}
                </div>
            </div>
            <Modal onClose={() => setIsDeleteTeamMemberModalOpen(false)}
                   isOpen={isDeleteTeamMemberModalOpen}>
                <Modal.Title>
                    <div className='members-delete-modal-header'>
                        Видалити члена команди?
                    </div>
                </Modal.Title>
                <Modal.Content>
                </Modal.Content>
                <Modal.Actions>
                    <div className='members-delete-modal-actions'>
                        <Button buttonStyle={"secondary"} onClick={() => setIsDeleteTeamMemberModalOpen(false)}>Ні</Button>
                        <Button buttonStyle={"primary"} onClick={handleDeleteMember}>Так</Button>
                    </div>
                </Modal.Actions>
            </Modal>

            {isEditMemberModalOpen && <Modal onClose={handleEditMemberOnClose} isOpen={isEditMemberModalOpen}>
                <Modal.Title>
                    Редагування учасника команди
                </Modal.Title>
                <Modal.Content>
                    <MemberForm onValuesChange={mfv => setMemberToEdit(mfv)} existingMemberFormValues={memberToEdit}
                                id='edit-member-modal'
                                onSubmit={handleMemberEdit}/>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={handleSaveAsDraft} buttonStyle={'secondary'}>Зберегти як чернетку</Button>
                    <Button form='edit-member-modal' type={"submit"} buttonStyle={"primary"}>Опублікувати</Button>
                </Modal.Actions>
            </Modal>}
            <Modal isOpen={isConfirmPublishNewMemberModalOpen}
                   onClose={() => setIsConfirmPublishNewMemberModalOpen(false)}>
                <Modal.Title>
                    Опублікувати нового члена команди?
                </Modal.Title>
                <Modal.Content>

                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={handleCancelPublish} buttonStyle={"secondary"}>Ні</Button>
                    <Button onClick={handleConfirmPublish} buttonStyle={"primary"}>Так</Button>
                </Modal.Actions>
            </Modal>

            <Modal isOpen={isConfirmCloseModalOpen} onClose={() => setIsConfirmCloseModalOpen(false)}>
                <Modal.Title>
                    Зміни буде втрачено. Бажаєте продовжити?
                </Modal.Title>
                <Modal.Content>

                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setIsConfirmCloseModalOpen(false)} buttonStyle={'secondary'}>Ні</Button>
                    <Button buttonStyle={'primary'} onClick={handleConfirmClose}>Так</Button>
                </Modal.Actions>
            </Modal>
        </>
    );
}

