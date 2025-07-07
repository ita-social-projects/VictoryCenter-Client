import { render, screen } from "@testing-library/react";
import { ProgramCard } from "./ProgramCard";
import { Program } from "../../../../../types/ProgramPage";

describe("test program-card component", () => {
    const mockProgram: Program = {
        image: "https://via.placeholder.com/200x200?text=Ponys",
        title: "Коні лікують Літо 2025",
        subtitle: "Ветеранська програма",
        description:
            "Зменшення рівня стресу, тривоги та ПТСР у ветеранів, повернення відчуття контролю, розвиток внутрішньої сили та опори.",
    };
    test("should contain correct information", () => {
        render(<ProgramCard program={mockProgram} />);
        const title = screen.getByRole("heading", { name: mockProgram.title });
        expect(title).toBeInTheDocument();
        expect(title).toHaveClass("program-title");

        const subtitle = screen.getByText(mockProgram.subtitle);
        expect(subtitle).toBeInTheDocument();
        expect(subtitle).toHaveClass("program-subtitle");

        const description = screen.getByText(mockProgram.description);
        expect(description).toBeInTheDocument();
        expect(description).toHaveClass("program-description");

        const image = screen.getByAltText(mockProgram.title);
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", mockProgram.image);
        expect(image).toHaveClass("card-img");
    });
    test("should contain correct classes", () => {
        render(<ProgramCard program={mockProgram} />);
        const container = screen.getByAltText(mockProgram.title).closest(".card-block");
        expect(container).toBeInTheDocument();
    });
});
