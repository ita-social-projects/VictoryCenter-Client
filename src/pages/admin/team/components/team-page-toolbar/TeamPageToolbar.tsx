import PlusIcon from "../../../../../assets/icons/plus.svg";
import React, {useState} from "react";
import {Modal} from "../../../../../components/common/modal/Modal";
import {TeamCategory} from "../../TeamPage";
import {Button} from "../../../../../components/common/button/Button";
import {Select} from "../../../../../components/common/select/Select"
import {Input} from "../../../../../components/common/input/Input";
import {MemberForm, MemberFormValues} from "../member-form/MemberForm";


export type TeamPageToolbarProps = {
    onSearchQueryChange: (query: string) => void;
    onStatusFilterChange: (categoryFilter: StatusFilter) => void;
    autocompleteValues: string[];
};

export type StatusFilter = "Усі" | "Опубліковано" | "Чернетка";

export const TeamPageToolbar = ({
                                    onSearchQueryChange,
                                    onStatusFilterChange,
                                    autocompleteValues
                                }: TeamPageToolbarProps) => {
    const [isConfirmCloseModalOpen, setIsConfirmCloseModalOpen] = useState(false);
    const [isConfirmPublishNewMemberModalOpen, setIsConfirmPublishNewMemberModalOpen] = useState<boolean>(false);
    const [isAddTeamMemberModalOpen, setIsAddTeamMemberModalOpen] = useState(false);
    const [newTeamMemberInfo, setNewTeamMemberInfo] = useState<{
        category: TeamCategory,
        fullName: string,
        description: string,
        img: FileList | null
    } | null>(null);

    const handlePublish = (member: MemberFormValues) => {
        setIsConfirmPublishNewMemberModalOpen(true);
    }

    const handleSaveAsDraft = () => {
        //TODO: save member as draft
        setNewTeamMemberInfo(null);
        setIsAddTeamMemberModalOpen(false);
    }

    const handleCancelPublish = () => {
        setIsConfirmPublishNewMemberModalOpen(false);
    };

    const handleConfirmPublish = () => {
        setIsConfirmPublishNewMemberModalOpen(false);
        //TODO: handle confirm publish
        setIsAddTeamMemberModalOpen(false);
        setNewTeamMemberInfo(null)
    };
    const handleConfirmClose = () => {
        if (isAddTeamMemberModalOpen && newTeamMemberInfo != null) {
            setIsConfirmCloseModalOpen(false);
            setNewTeamMemberInfo(null);
            setIsAddTeamMemberModalOpen(false)
        }

        if (isAddTeamMemberModalOpen && (newTeamMemberInfo === null
            || (newTeamMemberInfo.img === null
                && !newTeamMemberInfo.category
                && !newTeamMemberInfo.fullName
                && !newTeamMemberInfo.description))) {
            setNewTeamMemberInfo(null);
            setIsAddTeamMemberModalOpen(false)
        }
    };

    const handleAddMemberOnClose = () => {
        if (isAddTeamMemberModalOpen && (newTeamMemberInfo === null
            || (newTeamMemberInfo.img === null
                && !newTeamMemberInfo.category
                && !newTeamMemberInfo.fullName
                && !newTeamMemberInfo.description))) {
            setNewTeamMemberInfo(null);
            setIsAddTeamMemberModalOpen(false)
            return;
        }
        if (isAddTeamMemberModalOpen) {
            setIsConfirmCloseModalOpen(true);
        }
    }

    return (<>
        <div className='toolbar'>
            <div className="toolbar-search">
                <Input onChange={onSearchQueryChange} autocompleteValues={autocompleteValues}></Input>
            </div>
            <div className="toolbar-actions">
                <Select onValueChange={(category: StatusFilter) => onStatusFilterChange(category)}>
                    <Select.Option name='Усі' value='Усі'></Select.Option>
                    <Select.Option name='Опубліковано' value='Опубліковано'></Select.Option>
                    <Select.Option name='Чернетка' value='Чернетка'></Select.Option>
                </Select>
                <Button onClick={() => setIsAddTeamMemberModalOpen(true)} buttonStyle={"primary"}>
                    Додати в команду
                    <img src={PlusIcon} alt="plus"/>
                </Button>
            </div>
        </div>
        <Modal onClose={handleAddMemberOnClose} isOpen={isAddTeamMemberModalOpen}>
            <Modal.Title>
                Додати в команду
            </Modal.Title>
            <Modal.Content>
                <MemberForm id='add-member-modal' onSubmit={handlePublish} />
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={handleSaveAsDraft} buttonStyle={'secondary'}>Зберегти як чернетку</Button>
                <Button form='add-member-modal' type={"submit"} buttonStyle={"primary"}>Опублікувати</Button>
            </Modal.Actions>
        </Modal>
        <Modal isOpen={isConfirmPublishNewMemberModalOpen} onClose={() => setIsConfirmPublishNewMemberModalOpen(false)}>
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
    </>);
}
