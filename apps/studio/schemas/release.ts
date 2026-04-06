import { defineField, defineType } from "sanity";
import { RiAlbumLine } from "react-icons/ri";

export const releaseType = defineType({
  name: "release",
  title: "Release",
  type: "document",
  icon: RiAlbumLine,
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
      description: "If published, the release will be active on the website.",
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
      name: "cover",
      title: "Cover",
      type: "richImage",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "coverAlt",
      title: "Cover (Alt)",
      type: "richImage"
    }),
    defineField({
      name: "backgroundColor",
      title: "List hover color",
      description: "Row background on hover (e.g. Club Eden release list).",
      type: "color"
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "richText"
    }),
    defineField({
      name: "embed",
      title: "Embed",
      description: "Paste iframe code to embed external media.",
      type: "text",
      rows: 4
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
      date: "release_date",
      media: "cover"
    },
    prepare({ title, date, media }) {
      return {
        title,
        subtitle: date ? new Date(date).toLocaleDateString() : undefined,
        media
      };
    }
  }
});

