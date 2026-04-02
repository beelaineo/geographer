import { defineField, defineType } from "sanity";

export const interviewEntryType = defineType({
  name: "interviewEntry",
  title: "Interview Entry",
  type: "object",
  fields: [
    defineField({
      name: "speakerRole",
      title: "Speaker Role",
      type: "string",
      options: {
        list: [
          { title: "Interviewer", value: "interviewer" },
          { title: "Interviewee", value: "interviewee" }
        ],
        layout: "radio"
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "speakerInitials",
      title: "Speaker Initials",
      description: "Initials shown for this question/answer line (e.g. AB, CD).",
      type: "string",
      validation: (rule) => rule.required().max(12)
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "richText",
      validation: (rule) => rule.required()
    })
  ],
  preview: {
    select: {
      initials: "speakerInitials",
      role: "speakerRole",
      text: "text.0.children.0.text"
    },
    prepare({ initials, role, text }) {
      const roleLabel =
        role === "interviewer"
          ? "Interviewer"
          : role === "interviewee"
            ? "Interviewee"
            : "Speaker";

      return {
        title: initials ? `${initials} (${roleLabel})` : roleLabel,
        subtitle: text || "No text"
      };
    }
  }
});
