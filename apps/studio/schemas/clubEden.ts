import { defineField, defineType } from "sanity";
import { RiVipCrownLine } from "react-icons/ri";

export const clubEdenType = defineType({
  name: "clubEden",
  title: "Club Eden",
  type: "document",
  icon: RiVipCrownLine,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "intro",
      title: "Intro",
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
