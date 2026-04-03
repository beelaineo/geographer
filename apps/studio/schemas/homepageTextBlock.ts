import { defineField, defineType } from "sanity";
import { RiArticleLine } from "react-icons/ri";

export const homepageTextBlockType = defineType({
  name: "homepageTextBlock",
  title: "Text Block",
  type: "object",
  icon: RiArticleLine,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "richText",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "cta",
      title: "Call to Action",
      type: "ctaLink"
    })
  ],
  preview: {
    select: {
      title: "title",
      ctaLabel: "cta.label"
    },
    prepare({ title, ctaLabel }) {
      return {
        title: title || "Text block",
        subtitle: ctaLabel ? `CTA: ${ctaLabel}` : "No CTA"
      };
    }
  }
});
