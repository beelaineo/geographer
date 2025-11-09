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
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3
    }),
    defineField({
      name: "embed",
      title: "Embed",
      description: "Paste iframe code to embed external media.",
      type: "text",
      rows: 4
    }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 2
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

