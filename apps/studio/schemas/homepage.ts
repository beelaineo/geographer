import { defineArrayMember, defineField, defineType } from "sanity";
import { RiHomeSmile2Line } from "react-icons/ri";

export const homepageType = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  icon: RiHomeSmile2Line,
  fields: [
    defineField({
      name: "content",
      title: "Content Blocks",
      type: "array",
      of: [
        defineArrayMember({ type: "homepageVideoBanner" }),
        defineArrayMember({ type: "homepageFeaturedInterview" }),
        defineArrayMember({ type: "homepageTextBlock" }),
        defineArrayMember({ type: "homepageFeaturedReleases" })
      ],
      validation: (rule) => rule.required().min(1)
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      validation: (rule) => rule.required()
    })
  ]
});
