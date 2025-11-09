import { aboutType } from "./about";
import { collectionType } from "./collection";
import { homepageType } from "./homepage";
import { menuItemType } from "./menuItem";
import { pressItemType } from "./pressItem";
import { projectType } from "./project";
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
  projectType,
  siteSettingsType,
  // Objects
  richTextType,
  richImageType,
  seoType,
  menuItemType,
  pressItemType
];
