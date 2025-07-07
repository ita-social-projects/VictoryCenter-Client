import "./team-page.scss";
import React from "react";
import { TeamPageContent } from "./components/team-page-content/TeamPageContent";

export type TeamCategory = "Основна команда" | "Наглядова рада" | "Радники";

export const TeamPageAdmin = () => {
    return <TeamPageContent></TeamPageContent>;
};
