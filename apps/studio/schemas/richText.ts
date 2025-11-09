import { defineArrayMember, defineField, defineType } from "sanity";

type PortableTextSpan = {
  _type?: string;
  text?: string;
};

type PortableTextBlock = {
  _type?: string;
  children?: PortableTextSpan[];
};

const internalLinkTargets = [
  { type: "about" },
  { type: "homepage" },
  { type: "release" },
  { type: "collection" },
  { type: "project" }
];

const richTextDefinition = {
  name: "richText",
  title: "Rich Text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Quote", value: "blockquote" }
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" }
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Code", value: "code" }
        ],
        annotations: [
          {
            name: "externalLink",
            type: "object",
            title: "External Link",
            fields: [
              defineField({
                name: "href",
                title: "URL",
                type: "url",
                validation: (rule) =>
                  rule.uri({
                    allowRelative: false,
                    scheme: ["http", "https", "mailto"]
                  })
              })
            ]
          },
          {
            name: "internalLink",
            type: "object",
            title: "Internal Link",
            fields: [
              defineField({
                name: "reference",
                title: "Reference",
                type: "reference",
                to: internalLinkTargets
              })
            ]
          }
        ]
      }
    }),
    defineArrayMember({
      type: "richImage"
    })
  ],
  preview: {
    select: {
      firstBlock: "0"
    },
    prepare({ firstBlock }: { firstBlock?: PortableTextBlock }) {
      if (!firstBlock || firstBlock._type !== "block") {
        return {
          title: "Rich text"
        };
      }

      const plainText =
        firstBlock.children
          ?.filter((child): child is PortableTextSpan => child?._type === "span")
          .map((child) => child.text || "")
          .join("")
          .trim() ?? "";

      const title = plainText
        ? plainText.length > 80
          ? `${plainText.slice(0, 77)}…`
          : plainText
        : "Rich text";

      return {
        title
      };
    }
  }
} as unknown as Parameters<typeof defineType>[0];

export const richTextType = defineType(richTextDefinition);

