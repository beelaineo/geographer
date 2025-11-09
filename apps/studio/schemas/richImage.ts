import { defineField, defineType } from "sanity";

export const richImageType = defineType({
  name: "richImage",
  title: "Rich Image",
  type: "image",
  options: {
    hotspot: true
  },
  fields: [
    defineField({
      name: "alt",
      title: "Alt Text",
      type: "string",
      validation: (rule) => rule.required().error("Provide descriptive alt text for accessibility.")
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "text",
      rows: 2
    })
  ]
});

