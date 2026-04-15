import { aboutType } from "./about";
import { clubEdenType } from "./clubEden";
import { collectionType } from "./collection";
import { contributorType } from "./contributor";
import { contributorsType } from "./contributors";
import { ctaLinkType } from "./ctaLink";
import { homepageType } from "./homepage";
import { homepageFeaturedInterviewType } from "./homepageFeaturedInterview";
import { homepageFeaturedReleasesType } from "./homepageFeaturedReleases";
import { homepageNewsletterSignupType } from "./homepageNewsletterSignup";
import { homepageTextBlockType } from "./homepageTextBlock";
import { homepageVideoBannerType } from "./homepageVideoBanner";
import { interviewBodyType } from "./interviewBody";
import { interviewEntryType } from "./interviewEntry";
import { interviewType } from "./interview";
import { lastTurnOurTurnType } from "./lastTurnOurTurn";
import { menuItemType } from "./menuItem";
import { pageType } from "./page";
import { pressItemType } from "./pressItem";
import { projectType } from "./project";
import { reclusType } from "./reclus";
import { releaseType } from "./release";
import { richImageType } from "./richImage";
import { richTextType } from "./richText";
import { seoType } from "./seo";
import { siteSettingsType } from "./siteSettings";

export const schemaTypes = [
  // Documents
  aboutType,
  homepageType,
  releaseType,
  collectionType,
  interviewType,
  contributorType,
  contributorsType,
  pageType,
  reclusType,
  lastTurnOurTurnType,
  clubEdenType,
  // Legacy types retained during redesign transition
  projectType,
  siteSettingsType,
  // Objects
  richTextType,
  interviewBodyType,
  interviewEntryType,
  richImageType,
  seoType,
  menuItemType,
  ctaLinkType,
  homepageVideoBannerType,
  homepageFeaturedInterviewType,
  homepageTextBlockType,
  homepageFeaturedReleasesType,
  homepageNewsletterSignupType,
  pressItemType
];
