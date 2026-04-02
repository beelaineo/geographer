import { defineArrayMember, defineType } from "sanity";

export const interviewBodyType = defineType({
  name: "interviewBody",
  title: "Interview Body",
  type: "array",
  of: [
    defineArrayMember({
      type: "interviewEntry"
    }),
    defineArrayMember({
      type: "richImage"
    })
  ]
});
