import { defineField, defineType } from "sanity";
import { RiVideoLine } from "react-icons/ri";

export const homepageVideoBannerType = defineType({
  name: "homepageVideoBanner",
  title: "Video Banner",
  type: "object",
  icon: RiVideoLine,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "mux.video",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "color"
    }),
    defineField({
      name: "mediaDescription",
      title: "Media Description (Accessibility)",
      description:
        "Describe the essential visual content for people using assistive technology.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required()
    })
  ],
  preview: {
    select: {
      title: "title"
    },
    prepare({ title }) {
      return {
        title: title || "Video banner"
      };
    }
  }
});
