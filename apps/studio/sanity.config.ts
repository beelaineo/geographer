import { colorInput } from "@sanity/color-input";
import { visionTool } from "@sanity/vision";
import { defineConfig, type SchemaTypeDefinition } from "sanity";
import { deskTool, type StructureBuilder } from "sanity/desk";
import { muxInput } from "sanity-plugin-mux-input";

import { aboutType } from "./schemas/about";
import { clubEdenType } from "./schemas/clubEden";
import { lastTurnOurTurnType } from "./schemas/lastTurnOurTurn";
import { reclusType } from "./schemas/reclus";
import { schemaTypes } from "./schemas";
import { homepageType } from "./schemas/homepage";
import { siteSettingsType } from "./schemas/siteSettings";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;

if (!projectId) {
  throw new Error("Missing SANITY_STUDIO_PROJECT_ID environment variable");
}

if (!dataset) {
  throw new Error("Missing SANITY_STUDIO_DATASET environment variable");
}

const singletonTypes = [
  "about",
  "homepage",
  "siteSettings",
  "reclus",
  "lastTurnOurTurn",
  "clubEden"
] as const;
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
    ),
  S.listItem()
    .title(reclusType.title || "Reclus")
    .id("reclus")
    .icon(reclusType.icon)
    .child(
      S.document()
        .schemaType("reclus")
        .documentId("reclus")
    ),
  S.listItem()
    .title(lastTurnOurTurnType.title || "Last Turn / Our Turn")
    .id("lastTurnOurTurn")
    .icon(lastTurnOurTurnType.icon)
    .child(
      S.document()
        .schemaType("lastTurnOurTurn")
        .documentId("lastTurnOurTurn")
    ),
  S.listItem()
    .title(clubEdenType.title || "Club Eden")
    .id("clubEden")
    .icon(clubEdenType.icon)
    .child(
      S.document()
        .schemaType("clubEden")
        .documentId("clubEden")
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
    colorInput(),
    muxInput()
  ],
  schema: {
    types: schemaTypes as SchemaTypeDefinition[]
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
