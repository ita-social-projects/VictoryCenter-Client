import { render, waitFor } from "@testing-library/react";
import { HomePage } from "./HomePage";
import * as HomePageDataFetchModule from "../../../services/data-fetch/user-pages-data-fetch/home-page-data-fetch/homePageDataFetch";

const spyHomePageDataFetch = jest.spyOn(HomePageDataFetchModule, "homePageDataFetch");

describe("HomePage", () => {
    const mockHeader = "Test Header";
    const mockContent = "Test Content";

    beforeEach(() => {
        spyHomePageDataFetch.mockResolvedValue({
            header: mockHeader,
            content: mockContent,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders the component", async () => {
        const { container } = render(<HomePage />);

        const header = container.querySelector(".header");
        const content = container.querySelector(".content");

        expect(header).toBeInTheDocument();
        expect(content).toBeInTheDocument();

        await waitFor(() => {
            expect(header?.textContent).toEqual(mockHeader);
            expect(content?.textContent).toEqual(mockContent);
        });

        expect(spyHomePageDataFetch).toHaveBeenCalledTimes(1);
    });
});
