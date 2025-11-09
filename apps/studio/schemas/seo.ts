import { defineField, defineType } from "sanity";

export const seoType = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.max(60).warning("Keep titles concise for search engines.")
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(160).warning("Meta descriptions should stay under 160 characters.")
    }),
    defineField({
      name: "image",
      title: "Share Image",
      type: "richImage"
    })
  ]
});

