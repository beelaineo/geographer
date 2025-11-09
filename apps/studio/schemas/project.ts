import { defineArrayMember, defineField, defineType } from "sanity";
import { RiLayoutColumnLine } from "react-icons/ri";

type PortableTextSpan = {
  _type?: string;
  text?: string;
};

type PortableTextBlock = {
  _type?: string;
  children?: PortableTextSpan[];
};

function getPortableTextPreview(value?: PortableTextBlock[] | PortableTextBlock | null) {
  if (!value) {
    return "Column";
  }

  const firstBlock: PortableTextBlock | undefined = Array.isArray(value) ? value[0] : value;

  if (!firstBlock || firstBlock._type !== "block") {
    return "Column";
  }

  const plainText =
    firstBlock.children
      ?.filter((child): child is PortableTextSpan => child?._type === "span")
      .map((child) => child.text || "")
      .join("")
      .trim() ?? "";

  if (!plainText) {
    return "Column";
  }

  return plainText.length > 80 ? `${plainText.slice(0, 77)}…` : plainText;
}

export const projectType = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: RiLayoutColumnLine,
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
      name: "location",
      title: "Location",
      type: "string"
    }),
    defineField({
      name: "dates",
      title: "Dates",
      type: "string"
    }),
    defineField({
      name: "partners",
      title: "Partners",
      type: "string"
    }),
    defineField({
      name: "columns",
      title: "Columns",
      type: "array",
      of: [
        defineArrayMember({
          name: "column",
          title: "Column",
          type: "object",
          fields: [
            defineField({
              name: "content",
              title: "Content",
              type: "richText"
            })
          ],
          preview: {
            select: {
              content: "content"
            },
            prepare({ content }: { content?: PortableTextBlock[] }) {
              return {
                title: getPortableTextPreview(content)
              };
            }
          }
        })
      ],
      validation: (rule) => rule.max(2)
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [defineArrayMember({ type: "richImage" })]
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [defineArrayMember({ type: "richImage" })]
    }),
    defineField({
      name: "press",
      title: "Press",
      type: "array",
      of: [defineArrayMember({ type: "pressItem" })]
    })
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "location",
      media: "gallery.0"
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle,
        media
      };
    }
  }
});

