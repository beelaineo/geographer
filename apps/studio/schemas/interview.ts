import { defineArrayMember, defineField, defineType } from "sanity";
import { RiQuestionAnswerLine } from "react-icons/ri";

export const interviewType = defineType({
  name: "interview",
  title: "Interview",
  type: "document",
  icon: RiQuestionAnswerLine,
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
      name: "published",
      title: "Published?",
      description: "When false, Reclus index line values are ciphered and the item is not linkable.",
      type: "boolean",
      initialValue: false,
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "release_date",
      title: "Release Date",
      type: "datetime",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "authors",
      title: "Author(s)",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "contributor" }]
        })
      ],
      validation: (rule) => rule.required().min(1)
    }),
    defineField({
      name: "authorInitials",
      title: "Author Initials",
      description: "Initials used as shorthand in interview formatting.",
      type: "string",
      validation: (rule) => rule.required().max(20)
    }),
    defineField({
      name: "cover",
      title: "Cover",
      type: "richImage",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "color"
    }),
    defineField({
      name: "quote",
      title: "Quote",
      description: "Hover quote, max. 350 characters",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(350)
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "interviewBody",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo"
    })
  ],
  preview: {
    select: {
      title: "title",
      date: "release_date",
      media: "cover"
    },
    prepare({ title, date, media }) {
      return {
        title: title || "Untitled interview",
        subtitle: date ? new Date(date).toLocaleDateString() : "No release date",
        media
      };
    }
  }
});
