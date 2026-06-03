import { runPublishModalTests } from '@/utils/test-mocks/publish-modal-test-helpers';
import { MainPagePublishModal } from './MainPagePublishModal';

jest.mock(
    '@/components/admin/confirmation-modal/ConfirmationModal',
    () => require('@/utils/test-mocks/publish-modal-test-helpers').confirmationModalMockImpl,
);

describe('MainPagePublishModal', () => {
    runPublishModalTests(MainPagePublishModal);
});
