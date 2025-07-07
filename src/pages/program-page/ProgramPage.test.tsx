import React from "react";
import { render, screen } from "@testing-library/react";
import { ProgramPage } from "./ProgramPage";

jest.mock("./program-page/intro-section/IntroSection", () => ({
    IntroSection: () => <div data-testid="intro-section">IntroSection</div>,
}));

jest.mock("./program-page/program-section/ProgramSection", () => ({
    ProgramSection: () => <div data-testid="program-section">ProgramSection</div>,
}));

jest.mock("./program-page/question-section/QuestionSection", () => ({
    QuestionSection: () => <div data-testid="question-section">QuestionSection</div>,
}));

jest.mock("./program-page/contact-section/ContactSection", () => ({
    ContactSection: () => <div data-testid="contact-section">ContactSection</div>,
}));

describe("ProgramPage", () => {
    test("should render all sections", () => {
        render(<ProgramPage />);

        expect(screen.getByTestId("intro-section")).toBeInTheDocument();
        expect(screen.getByTestId("program-section")).toBeInTheDocument();
        expect(screen.getByTestId("question-section")).toBeInTheDocument();
        expect(screen.getByTestId("contact-section")).toBeInTheDocument();
    });
});
