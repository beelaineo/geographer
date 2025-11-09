import { defineField, defineType } from "sanity";
import { RiInformationLine } from "react-icons/ri";

export const aboutType = defineType({
  name: "about",
  title: "About",
  type: "document",
  icon: RiInformationLine,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "richText",
      title: "Rich Text",
      type: "richText",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "richImage"
    }),
    defineField({
      name: "imageText",
      title: "Image Text",
      type: "richText"
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      validation: (rule) => rule.required()
    })
  ]
});

