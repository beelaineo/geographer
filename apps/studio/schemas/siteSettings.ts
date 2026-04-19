import { defineArrayMember, defineField, defineType } from "sanity";
import { RiSettings4Line } from "react-icons/ri";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: RiSettings4Line,
  fields: [
    defineField({
      name: "mainMenu",
      title: "Main Menu",
      type: "array",
      of: [defineArrayMember({ type: "menuItem" })]
    }),
    defineField({
      name: "footerMenu",
      title: "Footer Menu",
      type: "array",
      of: [defineArrayMember({ type: "menuItem" })]
    }),
    defineField({
      name: "overlayBGColor",
      title: "Overlay Background Color",
      description: "Used for release/newsletter overlay routes.",
      type: "color"
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      description: "Browser tab icon for the site metadata.",
      type: "richImage"
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo"
    })
  ],
  preview: {
    prepare() {
      return {
        title: "Site Settings"
      };
    }
  }
});

