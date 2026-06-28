import { runPublishModalTests } from '@/utils/test-mocks/publish-modal-test-helpers';
import { CompanyProfilePublishModal } from './CompanyProfilePublishModal';

jest.mock(
    '@/components/admin/confirmation-modal/ConfirmationModal',
    () => require('@/utils/test-mocks/publish-modal-test-helpers').confirmationModalMockImpl,
);

describe('CompanyProfilePublishModal', () => {
    runPublishModalTests(CompanyProfilePublishModal);
});
