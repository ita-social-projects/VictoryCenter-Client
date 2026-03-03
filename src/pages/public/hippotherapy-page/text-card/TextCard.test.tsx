import { render, screen } from "@testing-library/react";
import { TextCard } from "./TextCard";

describe('TextCard', () => {
    it('renders title and text correctly', () => {
        const content = {
            title: 'Test Title',
            text: 'Test Text',
        };
        render(<TextCard content={content} />);
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Text')).toBeInTheDocument();
    })
});
