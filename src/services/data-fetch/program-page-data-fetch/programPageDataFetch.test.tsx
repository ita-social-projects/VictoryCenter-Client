import {programPageDataFetch, questionDataFetch} from "./programPageDataFetch";
import {MockCards} from "../../../utils/mock-data/program-page/programPage";
import {MockQuestions} from "../../../utils/mock-data/program-page/programPage";

describe('programPageDataFetch', () => {
    test(('should return the mockCards'), async () => {
        const data = await programPageDataFetch();
        expect(data).toBe(MockCards);
    })
    test('should return the mockQuestions', async () => {
        const data = await questionDataFetch();
        expect(data).toBe(MockQuestions);
    })
})