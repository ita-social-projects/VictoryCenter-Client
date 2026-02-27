import { TranslateLimits } from '@/types/admin/who-we-are';
import {
  MainPageProps,
  TeamPageProps,
  WhatWeDoPageProps,
  WhoWeSupportCardsProps,
  PeopleCardsProps,
} from '../../sections/SectionsProps';
import { SectionType } from '@/types/common/about-us';

export const LIMITS_BY_SECTION: Record<SectionType, TranslateLimits> = {
  [SectionType.Main]: {
    titleLimit: MainPageProps.titleLimit,
    descriptionLimit: MainPageProps.descriptionLimit,
  },
  [SectionType.WhatWeDo]: {
    descriptionLimit: WhatWeDoPageProps.descriptionLimit,
  },
  [SectionType.WhoWeSupport]: {
    descriptionLimit: WhoWeSupportCardsProps.descriptionLimit,
  },
  [SectionType.Team]: {
    descriptionLimit: TeamPageProps.descriptionLimit,
  },
  [SectionType.People]: {
    descriptionLimit: PeopleCardsProps.descriptionLimit,
  },
};