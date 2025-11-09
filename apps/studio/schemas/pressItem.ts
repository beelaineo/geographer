import { defineField, defineType } from "sanity";

export const pressItemType = defineType({
  name: "pressItem",
  title: "Press Item",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "externalLink",
      title: "External Link",
      type: "url",
      validation: (rule) =>
        rule.uri({
          allowRelative: false,
          scheme: ["http", "https"]
        })
    }),
    defineField({
      name: "file",
      title: "File",
      type: "file",
      options: {
        accept: ".pdf"
      }
    })
  ]
});

