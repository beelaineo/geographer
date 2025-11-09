import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { deskTool, type StructureBuilder } from "sanity/desk";
import { muxInput } from "sanity-plugin-mux-input";

import { aboutType } from "./schemas/about";
import { schemaTypes } from "./schemas";
import { homepageType } from "./schemas/homepage";
import { siteSettingsType } from "./schemas/siteSettings";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

if (!projectId) {
  throw new Error("Missing SANITY_STUDIO_PROJECT_ID environment variable");
}

const singletonTypes = ["about", "homepage", "siteSettings"] as const;
type SingletonType = (typeof singletonTypes)[number];
const singletonSet = new Set<SingletonType>(singletonTypes);

const singletonItems = (S: StructureBuilder) => [
  S.listItem()
    .title(aboutType.title || "About")
    .id("about")
    .icon(aboutType.icon)
    .child(
      S.document()
        .schemaType("about")
        .documentId("about")
    ),
  S.listItem()
    .title(homepageType.title || "Homepage")
    .id("homepage")
    .icon(homepageType.icon)
    .child(
      S.document()
        .schemaType("homepage")
        .documentId("homepage")
    ),
  S.listItem()
    .title(siteSettingsType.title || "Site Settings")
    .id("siteSettings")
    .icon(siteSettingsType.icon)
    .child(
      S.document()
        .title("Settings")
        .schemaType("siteSettings")
        .documentId("siteSettings")
    )
];

export default defineConfig({
  name: "default",
  title: "Geographer Studio",
  projectId,
  dataset,
  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            ...singletonItems(S),
            S.divider(),
            ...S.documentTypeListItems().filter((listItem) => {
              const id = listItem.getId();
              if (!id) {
                return true;
              }
              return !singletonSet.has(id as SingletonType);
            })
          ])
    }),
    visionTool(),
    muxInput()
  ],
  schema: {
    types: schemaTypes
  },
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter(
          (templateItem) =>
            templateItem.templateId && !singletonSet.has(templateItem.templateId as SingletonType)
        );
      }
      return prev;
    },
    actions: (prev, { schemaType }) => {
      if (singletonSet.has(schemaType as SingletonType)) {
        return prev.filter(({ action }) => action !== "duplicate");
      }
      return prev;
    }
  }
});
