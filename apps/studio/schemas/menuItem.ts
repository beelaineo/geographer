import { defineField, defineType } from "sanity";

const internalLinkTargets = [
  { type: "about" },
  { type: "homepage" },
  { type: "release" },
  { type: "collection" },
  { type: "project" }
];

export const menuItemType = defineType({
  name: "menuItem",
  title: "Menu Item",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "linkType",
      title: "Link Type",
      type: "string",
      options: {
        list: [
          { title: "Internal", value: "internal" },
          { title: "External", value: "external" }
        ],
        layout: "radio"
      },
      initialValue: "internal",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "internalLink",
      title: "Internal Link",
      type: "reference",
      to: internalLinkTargets,
      hidden: ({ parent }) => parent?.linkType !== "internal",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.parent?.linkType === "internal" && !value) {
            return "Select an internal document.";
          }
          return true;
        })
    }),
    defineField({
      name: "externalLink",
      title: "External Link",
      type: "url",
      hidden: ({ parent }) => parent?.linkType !== "external",
      validation: (rule) =>
        rule
          .uri({
            allowRelative: false,
            scheme: ["http", "https"]
          })
          .custom((value, context) => {
            if (context.parent?.linkType === "external" && !value) {
              return "Provide a URL for external links.";
            }
            return true;
          })
    })
  ],
  preview: {
    select: {
      title: "label",
      linkType: "linkType",
      internalTitle: "internalLink.title",
      externalLink: "externalLink"
    },
    prepare({ title, linkType, internalTitle, externalLink }) {
      const subtitle =
        linkType === "external"
          ? externalLink
          : internalTitle || "Internal link";

      return {
        title,
        subtitle
      };
    }
  }
});

