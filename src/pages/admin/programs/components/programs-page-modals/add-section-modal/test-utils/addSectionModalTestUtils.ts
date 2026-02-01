import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddSectionModal } from '../AddSectionModal';
import type { AddSectionModalProps } from '../AddSectionModal';
import { PROGRAMS_TEXT } from '@/const/admin/programs';

export const renderAddSectionModal = (props: AddSectionModalProps) => {
    render(React.createElement(AddSectionModal, props));
};

export const getModal = () => screen.queryByTestId('add-section-modal');

export const getSwiper = () => screen.getByTestId('swiper');

export const getChooseButton = () => screen.getByRole('button', { name: PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION });

export const getPrevButton = () => screen.getByTitle('Previous slide');

export const getNextButton = () => screen.getByTitle('Next slide');

export const getCloseButton = () => screen.getByTestId('modal-close-btn');

export const getContentAreas = () => screen.queryAllByTestId('add-section-modal-content');

export const clickChooseButton = () => fireEvent.click(getChooseButton());

export const clickPrevButton = () => fireEvent.click(getPrevButton());

export const clickNextButton = () => fireEvent.click(getNextButton());

export const clickCloseButton = () => fireEvent.click(getCloseButton());

export const buildFiveShortDescriptions = () =>
    Array.from({ length: 5 }, () => PROGRAMS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT_SHORT);

export const findFirstCallByTemplateId = (mockFn: jest.Mock, templateId: any) => {
    const calls = mockFn.mock.calls.map((call) => call[0]);
    return calls.find((callItem) => callItem?.templateId === templateId);
};
