import { render, waitFor } from '@testing-library/react';
import { HippotherapyPage } from './HippotherapyPage';
import { hippotherapyMock as mockHippotherapyData } from '@/utils/mock-data/public/hippotherapy';
import { LoadableContent } from '@/components/common/loadable-content/LoadableContent';

jest.mock('@/components/common/loadable-content/LoadableContent');
const MockLoadableContent = LoadableContent as jest.Mock;

jest.mock('@/hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: () => ({ data: mockHippotherapyData }),
}));

describe('HippotherapyPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        MockLoadableContent.mockImplementation(() => <div></div>);
    });

    it('should render HippotherapyIntro component', async () => {
        render(<HippotherapyPage />);
        await waitFor(() => {
            expect(MockLoadableContent).toHaveBeenCalledWith(
                expect.objectContaining({ isLoading: false, error: false }),
                undefined,
            );
        });
    });
});
