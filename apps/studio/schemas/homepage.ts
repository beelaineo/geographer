import { defineArrayMember, defineField, defineType } from "sanity";
import { RiHomeSmile2Line } from "react-icons/ri";

export const homepageType = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  icon: RiHomeSmile2Line,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(1)
    }),
    defineField({
      name: "videos",
      title: "Videos",
      type: "array",
      of: [defineArrayMember({ type: "mux.video" })],
      validation: (rule) => rule.unique()
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      validation: (rule) => rule.required()
    }),
  ]
});
