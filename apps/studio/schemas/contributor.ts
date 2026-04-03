import { defineField, defineType } from "sanity";
import { RiUser3Line } from "react-icons/ri";

export const contributorType = defineType({
  name: "contributor",
  title: "Contributor",
  type: "document",
  icon: RiUser3Line,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "sortName",
      title: "Sort Name",
      description: "Optional custom sort label (e.g. Lastname, Firstname).",
      type: "string"
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "url",
      validation: (rule) =>
        rule.uri({
          allowRelative: false,
          scheme: ["http", "https", "mailto"]
        })
    })
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "sortName"
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Untitled contributor",
        subtitle: subtitle || "Contributor"
      };
    }
  }
});
