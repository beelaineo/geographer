import { defineField, defineType } from "sanity";
import { RiMailSendLine } from "react-icons/ri";

export const homepageNewsletterSignupType = defineType({
  name: "homepageNewsletterSignup",
  title: "Newsletter Signup Block",
  type: "object",
  icon: RiMailSendLine,
  fields: [
    defineField({
      name: "ctaLabel",
      title: "CTA Label",
      type: "string",
      initialValue: "Submit",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "emailPlaceholder",
      title: "Email Placeholder",
      type: "string",
      initialValue: "email address",
      validation: (rule) => rule.required()
    })
  ],
  preview: {
    select: {
      ctaLabel: "ctaLabel",
      emailPlaceholder: "emailPlaceholder"
    },
    prepare({ ctaLabel, emailPlaceholder }) {
      return {
        title: "Newsletter Signup Block",
        subtitle: `${ctaLabel || "Submit"} · ${emailPlaceholder || "email address"}`
      };
    }
  }
});
