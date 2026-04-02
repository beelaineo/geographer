import { defineField, defineType } from "sanity";
import { RiMoonClearLine } from "react-icons/ri";

export const reclusType = defineType({
  name: "reclus",
  title: "Reclus",
  type: "document",
  icon: RiMoonClearLine,
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
      name: "seo",
      title: "SEO",
      type: "seo",
      validation: (rule) => rule.required()
    })
  ]
});
