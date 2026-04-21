import { defineField, defineType } from "sanity";
import { RiGroupLine } from "react-icons/ri";

export const contributorsType = defineType({
  name: "contributors",
  title: "Contributors",
  type: "document",
  icon: RiGroupLine,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "list",
      title: "List",
      type: "array",
      of: [
        defineField({
          name: "contributor",
          type: "reference",
          to: [{ type: "contributor" }]
        })
      ],
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
