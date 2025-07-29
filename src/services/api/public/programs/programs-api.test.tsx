import { MockCards, MockQuestions } from '../../../../utils/mock-data/public/program-page/programs-page';
import { programPageDataFetch, questionDataFetch } from './programs-api';

describe('programPageDataFetch', () => {
    test('should return the mockCards', async () => {
        const data = await programPageDataFetch();
        expect(data).toBe(MockCards);
    });
    test('should return the mockQuestions', async () => {
        const data = await questionDataFetch();
        expect(data).toBe(MockQuestions);
    });
});
