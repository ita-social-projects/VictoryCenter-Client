export interface HippotherapyDefaultSection {
    title: string;
    text: string;
}

export interface Quote {
    text: string;
    imgURL: string;
    imgAlternativeText?: string;
}

export interface HippotherapyIntroData {
    imgURL: string;
    imgAlternativeText?: string;
    title: string;
    description: string;
}

export interface HippoventionCenterData {
    title: string;
    imgURL: string;
    imgAlternativeText?: string;
    pros: string[];
    text: string;
}

export interface HippotherapySwipedCard {
    imgURL: string;
    imgAlternativeText: string;
    text: string;
}

export interface HippotherapyAdvantagesSection {
    title: string;
    advantages: HippotherapySwipedCard[];
}

export interface HippotherapyParticipantsSection {
    title: string;
    participants: HippotherapySwipedCard[];
}

export interface HippotherapyEthicsSection {
    title: string;
    imgURL: string;
    imgAlternativeText: string;
    text: string;
    principles: string[];
}

export interface HippotherapyAbout {
    introSection: HippotherapyIntroData;
    descriptionSection: HippotherapyDefaultSection;
    quoteSection: Quote;
    hippoventionSection: HippotherapyDefaultSection;
    hippoventionCenterSection: HippoventionCenterData;
    advantagesSection: HippotherapyAdvantagesSection;
    analysisSection: HippotherapyDefaultSection;
    researchSection: {
        description: string;
        researches: { text: string; url: string }[];
    };
    anotherQuoteSection: Quote;
    participantsSection: HippotherapyParticipantsSection;
    ethicsSection: HippotherapyEthicsSection;
}
