import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnerPanel } from './PartnerPanel';

jest.mock('../partners/components/partner-panel-content/PartnerPanelContent', () => ({
    PartnerPanelContent: () => <div data-testid="partner-panel-content" />,
}));

describe('PartnerPanel', () => {
    it('renders PartnerPanelContent', () => {
        render(<PartnerPanel />);

        expect(screen.getByTestId('partner-panel-content')).toBeInTheDocument();
    });
});
