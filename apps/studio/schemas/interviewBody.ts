import { defineArrayMember, defineType } from "sanity";

export const interviewBodyType = defineType({
  name: "interviewBody",
  title: "Interview Body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Quote", value: "blockquote" }
      ]
    }),
    defineArrayMember({
      type: "interviewEntry"
    }),
    defineArrayMember({
      type: "richImage"
    })
  ]
});
