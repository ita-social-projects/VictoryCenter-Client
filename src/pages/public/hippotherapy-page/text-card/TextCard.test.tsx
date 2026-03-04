import { render, screen } from "@testing-library/react";
import { TextCard } from "./TextCard";

describe('TextCard', () => {
    it('renders title and text correctly', () => {
        render(<TextCard title='Test Title' text='Test Text' />);
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Text')).toBeInTheDocument();
    })
});
