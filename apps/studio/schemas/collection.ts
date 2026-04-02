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
      description: "Legacy field retained temporarily during redesign transition.",
      type: "richImage",
    }),
    defineField({
      name: "lines",
      title: "Lines",
      description: "Legacy field retained temporarily during redesign transition.",
      type: "array",
      of: [
        defineArrayMember({
          name: "line",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required()
            }),
            defineField({
              name: "value",
              title: "Value",
              type: "string",
              validation: (rule) => rule.required()
            }),
            defineField({
              name: "link",
              title: "Link (optional)",
              type: "url"
            })
          ]
        })
      ]
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "richText",
      validation: (rule) => rule.required()
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
      ],
      validation: (rule) => rule.required().min(1)
    }),
    defineField({
      name: "press",
      title: "Press",
      description: "Legacy field retained temporarily during redesign transition.",
      type: "array",
      of: [defineArrayMember({ type: "pressItem" })]
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

