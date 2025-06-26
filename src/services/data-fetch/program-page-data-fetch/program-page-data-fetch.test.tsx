import { programPageDataFetch, questionDataFetch } from "./program-page-data-fetch";
import { MockCards, MockQuestions } from '../../../utils/mock-data/program-page/program-page';

describe('programPageDataFetch', () => {
    test(('should return the mockCards'), async () => {
        const data = await programPageDataFetch();
        expect(data).toBe(MockCards);
    });
    test('should return the mockQuestions', async () => {
        const data = await questionDataFetch();
        expect(data).toBe(MockQuestions);
    });
});
