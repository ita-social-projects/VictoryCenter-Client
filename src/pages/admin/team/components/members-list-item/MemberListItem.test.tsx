import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { MembersListItem } from "./MembersListItem";
import { Member } from "../members-list/MembersList";

jest.mock("../../../../../assets/icons/dragger.svg", () => "drag-icon.svg");

const mockMember: Member = {
    id: 1,
    img: "avatar.png",
    fullName: "John Doe",
    description: "Senior Developer",
    status: "Чернетка",
    category: "Основна команда"
};

describe("MembersListItem", () => {
    const setup = (draggedIndex: number | null = null) => {
        const props = {
            member: mockMember,
            index: 1,
            draggedIndex,
            handleDragOver: jest.fn(),
            handleDragStart: jest.fn(),
            handleDrag: jest.fn(),
            handleDragEnd: jest.fn(),
            handleDrop: jest.fn(),
            handleOnDeleteMember: jest.fn(),
            handleOnEditMember: jest.fn(),
        };

        const utils = render(<MembersListItem {...props} />);
        return { ...utils, props };
    };

    it("renders member details correctly", () => {
        const { getByText, getByAltText } = setup();
        expect(getByText("John Doe")).toBeInTheDocument();
        expect(getByText("Senior Developer")).toBeInTheDocument();
        expect(getByText("Чернетка")).toBeInTheDocument();
        expect(getByAltText("Drag Handle")).toBeInTheDocument();
        expect(getByAltText("John Doe-img")).toBeInTheDocument();
    });

    it("adds dragging class when draggedIndex equals index", () => {
        const { container } = setup(1);
        const wrapper = container.querySelector(".members-wrapper");
        expect(wrapper?.className).toContain("dragging");
    });

    it("does not add dragging class when draggedIndex is different", () => {
        const { container } = setup(2);
        const wrapper = container.querySelector(".members-wrapper");
        expect(wrapper?.className).not.toContain("dragging");
    });

    it("calls drag event handlers correctly", () => {
        const { container, props } = setup();
        const wrapper = container.querySelector(".members-wrapper")!;
        const dragger = container.querySelector(".members-dragger")!;

        fireEvent.dragOver(wrapper);
        expect(props.handleDragOver).toHaveBeenCalled();

        fireEvent.drop(wrapper);
        expect(props.handleDrop).toHaveBeenCalledWith(1);

        fireEvent.dragStart(dragger);
        expect(props.handleDragStart).toHaveBeenCalled();

        fireEvent.drag(dragger);
        expect(props.handleDrag).toHaveBeenCalled();

        fireEvent.dragEnd(dragger);
        expect(props.handleDragEnd).toHaveBeenCalledTimes(2);
    });

    it("calls handleOnEditMember on edit icon click", () => {
        const { container, props } = setup();
        const editIcon = container.querySelector(".members-actions-edit")!;
        fireEvent.click(editIcon);
        expect(props.handleOnEditMember).toHaveBeenCalledWith(1);
    });

    it("calls handleOnDeleteMember on delete icon click", () => {
        const { container, props } = setup();
        const deleteIcon = container.querySelector(".members-actions-delete")!;
        fireEvent.click(deleteIcon);
        expect(props.handleOnDeleteMember).toHaveBeenCalledWith("John Doe");
    });
});

