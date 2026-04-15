import { defineField, defineType } from "sanity";
import { RiAlbumLine } from "react-icons/ri";

export const homepageFeaturedReleasesType = defineType({
  name: "homepageFeaturedReleases",
  title: "Featured Releases",
  type: "object",
  icon: RiAlbumLine,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "richImage",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "hoverImage",
      title: "Hover image",
      type: "richImage",
      description: "Shown on hover for non-mobile devices."
    }),
  ],
  preview: {
    select: {
      title: "title"
    },
    prepare({ title }) {
      return {
        title: title || "Featured releases",
        subtitle: "Shows the 2 newest published releases"
      };
    }
  }
});
