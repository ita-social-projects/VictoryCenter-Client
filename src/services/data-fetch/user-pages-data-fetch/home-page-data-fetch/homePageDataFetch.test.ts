import { homePageDataFetch } from "./homePageDataFetch";
import { homePageMock } from "../../../../utils/mock-data/user-pages/home-page/home-page";

describe("homePageDataFetch", () => {
    it("should return the homePageMock data", async () => {
        const data = await homePageDataFetch();
        expect(data).toBe(homePageMock);
    });
});
