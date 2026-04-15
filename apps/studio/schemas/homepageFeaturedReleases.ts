import { defineArrayMember, defineField, defineType } from "sanity";
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
    })
  ],
  preview: {
    select: {
      title: "title",
      count: "releases.length"
    },
    prepare({ title, count }) {
      const releaseCount = typeof count === "number" ? count : 0;
      return {
        title: title || "Featured releases",
        subtitle: `${releaseCount} release${releaseCount === 1 ? "" : "s"}`
      };
    }
  }
});
