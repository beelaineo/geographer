import { defineField, defineType } from "sanity";
import { RiLoopLeftLine } from "react-icons/ri";

export const lastTurnOurTurnType = defineType({
  name: "lastTurnOurTurn",
  title: "Last Turn / Our Turn",
  type: "document",
  icon: RiLoopLeftLine,
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
