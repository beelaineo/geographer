import { defineField, defineType } from "sanity";
import { RiDiscussLine } from "react-icons/ri";

export const homepageFeaturedInterviewType = defineType({
  name: "homepageFeaturedInterview",
  title: "Featured Interview",
  type: "object",
  icon: RiDiscussLine,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required()
    })
  ],
  preview: {
    select: {
      title: "title"
    },
    prepare({ title }) {
      return {
        title: title || "Featured interview",
        subtitle: "Auto-selects latest published interview"
      };
    }
  }
});
