import { defineField, defineType } from "sanity";
import { RiFileTextLine } from "react-icons/ri";

export const pageType = defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: RiFileTextLine,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96
      },
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
  ],
  preview: {
    select: {
      title: "title"
    },
    prepare({ title }) {
      return {
        title: title || "Untitled page"
      };
    }
  }
});
