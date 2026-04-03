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
    }),
    defineField({
      name: "interview",
      title: "Interview",
      type: "reference",
      to: [{ type: "interview" }],
      validation: (rule) => rule.required()
    })
  ],
  preview: {
    select: {
      title: "title",
      interviewTitle: "interview.title"
    },
    prepare({ title, interviewTitle }) {
      return {
        title: title || "Featured interview",
        subtitle: interviewTitle || "No interview selected"
      };
    }
  }
});
