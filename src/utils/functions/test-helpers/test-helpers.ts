import { screen } from '@testing-library/react';

export const checkForSubstrings = (line: string) => {
    expect(screen.getByText((content) => content.includes(line.trim()))).toBeInTheDocument();
};
