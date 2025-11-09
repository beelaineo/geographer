import { defineArrayMember, defineField, defineType } from "sanity";
import { RiFolder3Line } from "react-icons/ri";

export const collectionType = defineType({
  name: "collection",
  title: "Collection",
  type: "document",
  icon: RiFolder3Line,
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
      name: "hero",
      title: "Hero",
      type: "richImage",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string"
    }),
    defineField({
      name: "dates",
      title: "Dates",
      type: "string"
    }),
    defineField({
      name: "partners",
      title: "Partners",
      type: "string"
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "richText"
    }),
    defineField({
      name: "releases",
      title: "Releases",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "release" }]
        })
      ]
    }),
    defineField({
      name: "press",
      title: "Press",
      type: "array",
      of: [defineArrayMember({ type: "pressItem" })]
    })
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "location",
      media: "hero"
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle,
        media
      };
    }
  }
});

