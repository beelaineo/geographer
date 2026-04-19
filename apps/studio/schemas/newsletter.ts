import { RiMailLine } from "react-icons/ri";
import { defineField, defineType } from "sanity";

export const newsletterType = defineType({
  name: "newsletter",
  title: "Newsletter",
  type: "document",
  icon: RiMailLine,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "popupText",
      title: "Popup Text",
      type: "text",
      rows: 3
    }),
    defineField({
      name: "submitButtonLabel",
      title: "Submit Button Label",
      type: "string",
      initialValue: "Submit",
      validation: (rule) => rule.required()
    })
  ]
});
