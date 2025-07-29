import React from 'react';
import { render, screen } from '@testing-library/react';
import { Status } from './Status';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

describe('Status Component', () => {
    it('renders Draft status with correct text and class', () => {
        render(<Status status="Draft" />);

        const statusElement = screen.getByText(COMMON_TEXT_ADMIN.STATUS.DRAFT).closest('div');

        expect(statusElement).toHaveClass('status');
        expect(statusElement).toHaveClass('status-draft');
        expect(screen.getByText(COMMON_TEXT_ADMIN.STATUS.DRAFT)).toBeInTheDocument();
    });

    it('renders Published status with correct text and class', () => {
        render(<Status status="Published" />);

        const statusElement = screen.getByText(COMMON_TEXT_ADMIN.STATUS.PUBLISHED).closest('div');

        expect(statusElement).toHaveClass('status');
        expect(statusElement).toHaveClass('status-published');
        expect(screen.getByText(COMMON_TEXT_ADMIN.STATUS.PUBLISHED)).toBeInTheDocument();
    });

    it('renders correct DOM structure', () => {
        render(<Status status="Draft" />);

        const statusContainer = screen.getByText(COMMON_TEXT_ADMIN.STATUS.DRAFT).closest('div');
        const spans = statusContainer!.querySelectorAll('span');

        expect(spans).toHaveLength(2);
        expect(spans[0]).toHaveTextContent('•');
        expect(spans[1]).toHaveTextContent(COMMON_TEXT_ADMIN.STATUS.DRAFT);
    });

    it('applies correct class for Draft status', () => {
        render(<Status status="Draft" />);

        const statusElement = screen.getByText(COMMON_TEXT_ADMIN.STATUS.DRAFT).closest('div');

        expect(statusElement).toHaveClass('status', 'status-draft');
        expect(statusElement).not.toHaveClass('status-published');
    });

    it('applies correct class for Published status', () => {
        render(<Status status="Published" />);

        const statusElement = screen.getByText(COMMON_TEXT_ADMIN.STATUS.PUBLISHED).closest('div');

        expect(statusElement).toHaveClass('status', 'status-published');
        expect(statusElement).not.toHaveClass('status-draft');
    });

    it('uses correct constants for text', () => {
        render(<Status status="Draft" />);
        expect(screen.getByText(COMMON_TEXT_ADMIN.STATUS.DRAFT)).toBeInTheDocument();

        render(<Status status="Published" />);
        expect(screen.getByText(COMMON_TEXT_ADMIN.STATUS.PUBLISHED)).toBeInTheDocument();
    });

    it('handles invalid status type with default class', () => {
        render(<Status status={'InvalidStatus' as any} />);

        const statusElement = screen.getByText('InvalidStatus').closest('div');

        expect(statusElement).toHaveClass('status');
        expect(statusElement).toHaveClass('status-draft'); // default 'status-draft'
    });

    it('handles invalid status type with default text', () => {
        const invalidStatus = 'InvalidStatus' as any;
        render(<Status status={invalidStatus} />);

        expect(screen.getByText('InvalidStatus')).toBeInTheDocument();
    });
});
