import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { TeamPage } from "./TeamPage";
import * as TeamPageDataFetchModule from "../../../services/data-fetch/user-pages-data-fetch/team-page-data-fetch/TeamPageDataFetch";

jest.mock(
  "../../../assets/team_page_images/horse_video.mp4",
  () => "mocked-video.mp4"
);

const spyTeamPageDataFetch = jest.spyOn(TeamPageDataFetchModule, "teamPageDataFetch");

const mockTeamDataSingle = [
  {
    title: "Основна команда",
    description:
      "Люди, які щодня координують роботу програм, супроводжують учасників, будують логістику, фасилітують сесії.",
    members: [
      {
        id: 1,
        name: "Настя Попандопулус",
        role: "виконавча директорка",
        photo: "https://via.placeholder.com/200x250?text=Настя",
      },
    ],
  },
];

const mockTeamDataMultiple = [
  ...mockTeamDataSingle,
  {
    title: "Додаткова команда",
    description: "Інший опис",
    members: [
      {
        id: 1,
        name: "Іван Іванов",
        role: "учасник",
        photo: "https://via.placeholder.com/200x250?text=Іван",
      },
    ],
  },
];

jest.mock("./TeamMemberCard/TeamMemberCard", () => ({
  TeamMember: ({ member }: any) => (
    <div data-testid="team-member">
      <img alt={member.name} src={member.photo} />
      <div>{member.name}</div>
      <div>{member.role}</div>
    </div>
  ),
}));

describe("TeamPage component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch data and display the single team section correctly", async () => {
    spyTeamPageDataFetch.mockResolvedValueOnce({
      teamData: mockTeamDataSingle,
    });

    render(<TeamPage />);
    expect(spyTeamPageDataFetch).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText("Основна команда")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Люди, які щодня координують роботу програм, супроводжують учасників, будують логістику, фасилітують сесії."
        )
      ).toBeInTheDocument();

      expect(screen.getByText("Настя Попандопулус")).toBeInTheDocument();
      expect(screen.getByText("виконавча директорка")).toBeInTheDocument();
      expect(screen.getByAltText("Настя Попандопулус")).toHaveAttribute(
        "src",
        "https://via.placeholder.com/200x250?text=Настя"
      );
    });
    const teamSections = document.querySelectorAll(".team-section");
    expect(teamSections.length).toBe(1);
    expect(teamSections[0].classList.contains("last-section")).toBe(true);
  });

  it("should render multiple team sections and assign the 'last-section' class only to the last", async () => {
    spyTeamPageDataFetch.mockResolvedValueOnce({
      teamData: mockTeamDataMultiple,
    });

    render(<TeamPage />);
    await waitFor(() => {
      expect(screen.getByText("Основна команда")).toBeInTheDocument();
      expect(screen.getByText("Додаткова команда")).toBeInTheDocument();
    });

    const teamSections = document.querySelectorAll(".team-section");
    expect(teamSections.length).toBe(2);
    expect(teamSections[0].classList.contains("last-section")).toBe(false);
    expect(teamSections[1].classList.contains("last-section")).toBe(true);
  });

  it("should render no team sections if the data is an empty array", async () => {
    spyTeamPageDataFetch.mockResolvedValueOnce({
      teamData: [],
    });

    render(<TeamPage />);

    await waitFor(() => {
      expect(document.querySelectorAll(".team-section").length).toBe(0);
    });
  });

  it("should handle fetch errors gracefully without crashing", async () => {
    spyTeamPageDataFetch.mockRejectedValueOnce(new Error("Fetch failed"));

    render(<TeamPage />);
    await waitFor(() => {
      expect(document.querySelectorAll(".team-section").length).toBe(0);
    });
  });

  it("should display the static quote and author", async () => {
    spyTeamPageDataFetch.mockResolvedValueOnce({ teamData: [] });

    render(<TeamPage />);

    const quoteText =
      "Я тут, тому що знаю з власного досвіду – коні нас рятують.";
    const author = "Вікторія Яковенко";

    await waitFor(() => {
      expect(screen.getByText(author)).toBeInTheDocument();
      expect(screen.getByText(quoteText)).toBeInTheDocument();
    });
  });

  it("should render the background video element", async () => {
    spyTeamPageDataFetch.mockResolvedValueOnce({ teamData: [] });

    render(<TeamPage />);

    const videoElement = await waitFor(() => document.querySelector("video"));

    expect(videoElement).toBeInTheDocument();
    expect(videoElement?.querySelector("source")?.getAttribute("src")).toBe(
      "mocked-video.mp4"
    );
    expect(videoElement?.hasAttribute("autoplay")).toBe(true);
    expect(videoElement?.hasAttribute("loop")).toBe(true);
    expect(videoElement?.hasAttribute("playsinline")).toBe(true);
  });
});
