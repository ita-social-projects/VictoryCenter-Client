import React from 'react';
import { render, screen } from '@testing-library/react';
import Status from './Status';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

jest.mock('../../../const/admin/common', () => ({
    COMMON_TEXT_ADMIN: {
        STATUS: {
            DRAFT: 'Чернетка',
            PUBLISHED: 'Опубліковано',
        },
    },
}));

describe('Status Component', () => {
    it('renders Draft status with correct text and class', () => {
        render(<Status status="Draft" />);

        const statusElement = screen.getByText('Чернетка').closest('div');

        expect(statusElement).toHaveClass('program-status');
        expect(statusElement).toHaveClass('draft');
        expect(screen.getByText('Чернетка')).toBeInTheDocument();
    });

    it('renders Published status with correct text and class', () => {
        render(<Status status="Published" />);

        const statusElement = screen.getByText('Опубліковано').closest('div');

        expect(statusElement).toHaveClass('program-status');
        expect(statusElement).toHaveClass('published');
        expect(screen.getByText('Опубліковано')).toBeInTheDocument();
    });

    it('renders correct DOM structure', () => {
        render(<Status status="Draft" />);

        const statusContainer = screen.getByText('Чернетка').closest('div');
        const spans = statusContainer!.querySelectorAll('span');

        expect(spans).toHaveLength(2);
        expect(spans[0]).toHaveTextContent('•');
        expect(spans[1]).toHaveTextContent('Чернетка');
    });

    it('applies correct class for Draft status', () => {
        render(<Status status="Draft" />);

        const statusElement = screen.getByText('Чернетка').closest('div');

        expect(statusElement).toHaveClass('program-status', 'draft');
        expect(statusElement).not.toHaveClass('published');
    });

    it('applies correct class for Published status', () => {
        render(<Status status="Published" />);

        const statusElement = screen.getByText('Опубліковано').closest('div');

        expect(statusElement).toHaveClass('program-status', 'published');
        expect(statusElement).not.toHaveClass('draft');
    });

    it('uses correct constants for text', () => {
        render(<Status status="Draft" />);
        expect(screen.getByText(COMMON_TEXT_ADMIN.STATUS.DRAFT)).toBeInTheDocument();

        render(<Status status="Published" />);
        expect(screen.getByText(COMMON_TEXT_ADMIN.STATUS.PUBLISHED)).toBeInTheDocument();
    });
});
