import { defineField, defineType } from "sanity";

import { internalLinkTargets } from "./internalLinkTargets";

export const ctaLinkType = defineType({
  name: "ctaLink",
  title: "CTA Link",
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
      hidden: ({ parent }: { parent?: { linkType?: string } }) => parent?.linkType !== "internal",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { linkType?: string } | undefined;
          if (parent?.linkType === "internal" && !value) {
            return "Select an internal document.";
          }
          return true;
        })
    }),
    defineField({
      name: "externalLink",
      title: "External Link",
      type: "url",
      hidden: ({ parent }: { parent?: { linkType?: string } }) => parent?.linkType !== "external",
      validation: (rule) =>
        rule
          .uri({
            allowRelative: false,
            scheme: ["http", "https"]
          })
          .custom((value, context) => {
            const parent = context.parent as { linkType?: string } | undefined;
            if (parent?.linkType === "external" && !value) {
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
      return {
        title,
        subtitle:
          linkType === "external"
            ? externalLink || "External link"
            : internalTitle || "Internal link"
      };
    }
  }
});
