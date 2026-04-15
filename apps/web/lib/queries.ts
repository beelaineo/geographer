import { defineQuery } from "groq";

const RICH_IMAGE_SELECTION = /* groq */ `{
  ...,
  alt,
  caption,
  asset->{
    ...,
    metadata{
      blurHash,
      dimensions{
        width,
        height,
        aspectRatio
      }
    }
  }
}`;

const RICH_TEXT_SELECTION = /* groq */ `[]{
  ...,
  markDefs[]{
    ...,
    _type == "internalLink" => {
      ...,
      reference->{
        _type,
        _id,
        title,
        slug
      }
    }
  },
  _type == "richImage" => {
    ...,
    alt,
    caption,
    asset->{
      ...,
      metadata{
        blurHash,
        dimensions{
          width,
          height,
          aspectRatio
        }
      }
    }
  }
}`;

const INTERVIEW_BODY_SELECTION = /* groq */ `[]{
  ...,
  markDefs[]{
    ...,
    _type == "internalLink" => {
      ...,
      reference->{
        _type,
        _id,
        title,
        slug
      }
    }
  },
  _type == "interviewEntry" => {
    ...,
    speakerRole,
    speakerInitials,
    text${RICH_TEXT_SELECTION}
  },
  _type == "richImage" => {
    ...,
    alt,
    caption,
    asset->{
      ...,
      metadata{
        blurHash,
        dimensions{
          width,
          height,
          aspectRatio
        }
      }
    }
  }
}`;

/** Inner fields for each menu item (use inside `mainMenu[]{ … }`, not with `…` spread). */
const MENU_ITEM_PROJECTION = /* groq */ `_key,
  label,
  linkType,
  internalLink->{
    _type,
    _id,
    title,
    slug
  },
  subLink,
  externalLink`;

const PRESS_ITEM_SELECTION = /* groq */ `{
  title,
  externalLink,
  file{
    asset->{
      _id,
      url,
      originalFilename,
      size,
      mimeType
    }
  }
}`;

const HOMEPAGE_CONTENT_SELECTION = /* groq */ `content[]{
  _key,
  _type,
  _type == "homepageVideoBanner" => {
    _key,
    _type,
    title,
    mediaDescription,
    backgroundColor,
    video{
      ...,
      asset->{
        _id,
        playbackId,
        status,
        data
      }
    }
  },
  _type == "homepageFeaturedInterview" => {
    _key,
    _type,
    title,
    interview->{
      _id,
      _type,
      title,
      slug,
      quote,
      cover${RICH_IMAGE_SELECTION}
    }
  },
  _type == "homepageTextBlock" => {
    _key,
    _type,
    title,
    body${RICH_TEXT_SELECTION},
    cta{
      label,
      linkType,
      internalLink->{
        _type,
        _id,
        title,
        slug
      },
      externalLink
    }
  },
  _type == "homepageFeaturedReleases" => {
    _key,
    _type,
    title,
    image${RICH_IMAGE_SELECTION},
    hoverImage${RICH_IMAGE_SELECTION},
    "releases": *[_type == "release" && published == true && defined(slug.current)] | order(release_date desc)[0...2]{
      _id,
      _type,
      title,
      slug,
      backgroundColor,
      "seriesTitles": *[_type == "collection" && references(^._id)].title
    }
  },
  _type == "homepageNewsletterSignup" => {
    _key,
    _type,
    ctaLabel,
    emailPlaceholder
  }
}`;

export const HOMEPAGE_QUERY = defineQuery(`
  *[_type == "homepage"][0]{
    ${HOMEPAGE_CONTENT_SELECTION},
    seo{
      title,
      description,
      image${RICH_IMAGE_SELECTION}
    }
  }
`);

export const ABOUT_QUERY = defineQuery(`
  *[_id == "about"][0]{
    richText${RICH_TEXT_SELECTION},
    image${RICH_IMAGE_SELECTION},
    imageText${RICH_TEXT_SELECTION},
    seo{
      title,
      description,
      image${RICH_IMAGE_SELECTION}
    }
  }
`);

export const CONTRIBUTORS_DOCUMENT_QUERY = defineQuery(`
  *[_id == "contributors"][0]{
    title,
    list[]->{
      _id,
      name,
      slug,
      sortName,
      link
    },
    seo{
      title,
      description,
      image${RICH_IMAGE_SELECTION}
    }
  }
`);

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0]{
    mainMenu[]{
      ${MENU_ITEM_PROJECTION}
    },
    footerMenu[]{
      ${MENU_ITEM_PROJECTION}
    },
    overlayBGColor,
    seo{
      title,
      description,
      image${RICH_IMAGE_SELECTION}
    }
  }
`);

export const RELEASE_SLUGS_QUERY = defineQuery(`
  *[_type == "release" && defined(slug.current)]{
    "slug": slug.current
  }
`);

export const RELEASES_QUERY = defineQuery(`
  *[_type == "release"] | order(release_date desc){
    _id,
    title,
    slug,
    release_date,
    published,
    cover${RICH_IMAGE_SELECTION},
    coverAlt${RICH_IMAGE_SELECTION},
    intro,
    quote
  }
`);

/** Releases for Club Eden listing, newest first. */
export const CLUB_EDEN_RELEASES_QUERY = defineQuery(`
  *[_type == "release" && defined(slug.current)] | order(release_date desc){
    _id,
    title,
    slug,
    published,
    backgroundColor,
    "seriesTitles": *[_type == "collection" && references(^._id)].title
  }
`);

/** Singleton Club Eden page copy (Studio document id \`clubEden\`). */
export const CLUB_EDEN_DOCUMENT_QUERY = defineQuery(`
  *[_id == "clubEden"][0]{
    title,
    intro${RICH_TEXT_SELECTION},
    seo{
      title,
      description,
      image${RICH_IMAGE_SELECTION}
    }
  }
`);

/** Singleton Newsletter page copy (Studio document id \`newsletter\`). */
export const NEWSLETTER_DOCUMENT_QUERY = defineQuery(`
  *[_id == "newsletter"][0]{
    title,
    text,
    submitButtonLabel
  }
`);

/** Singleton Reclus page copy (Studio document id \`reclus\`). */
export const RECLUS_DOCUMENT_QUERY = defineQuery(`
  *[_id == "reclus"][0]{
    title,
    body${RICH_TEXT_SELECTION},
    seo{
      title,
      description,
      image${RICH_IMAGE_SELECTION}
    }
  }
`);

/** Last Turn / Our Turn singleton page copy. */
export const LAST_TURN_OUR_TURN_DOCUMENT_QUERY = defineQuery(`
  *[_id == "lastTurnOurTurn"][0]{
    title,
    body${RICH_TEXT_SELECTION},
    seo{
      title,
      description,
      image${RICH_IMAGE_SELECTION}
    }
  }
`);

export const INTERVIEW_SLUGS_QUERY = defineQuery(`
  *[_type == "interview" && published == true && defined(slug.current)]{
    "slug": slug.current
  }
`);

export const INTERVIEW_BY_SLUG_QUERY = defineQuery(`
  *[_type == "interview" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    published,
    release_date,
    authorInitials,
    backgroundColor,
    quote,
    authors[]->{
      name
    },
    cover${RICH_IMAGE_SELECTION},
    body${INTERVIEW_BODY_SELECTION},
    seo{
      title,
      description,
      image${RICH_IMAGE_SELECTION}
    }
  }
`);

export const RELEASE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "release" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    release_date,
    published,
    cover${RICH_IMAGE_SELECTION},
    coverAlt${RICH_IMAGE_SELECTION},
    intro${RICH_TEXT_SELECTION},
    embed,
    seo{
      title,
      description,
      image${RICH_IMAGE_SELECTION}
    }
  }
`);

export const COLLECTION_SLUGS_QUERY = defineQuery(`
  *[_type == "collection" && defined(slug.current)]{
    "slug": slug.current
  }
`);

/** Published collections for `/club-eden/[collectionSlug]` static paths (`published` defaults to true when unset). */
export const CLUB_EDEN_COLLECTION_SLUGS_QUERY = defineQuery(`
  *[_type == "collection" && defined(slug.current) && coalesce(published, true) == true]{
    "collectionSlug": slug.current
  }
`);

export const COLLECTIONS_QUERY = defineQuery(`
  *[_type == "collection"] | order(_createdAt desc){
    _id,
    title,
    slug,
    hero${RICH_IMAGE_SELECTION},
    lines[]{
      label,
      value,
      link
    },
    intro${RICH_TEXT_SELECTION},
    releases[]{
      ...,
      _type == "reference" => @->{
        _id,
        title,
        slug,
        release_date,
        published,
        cover${RICH_IMAGE_SELECTION}
      }
    },
    press[]{
      ...${PRESS_ITEM_SELECTION}
    }
  }
`);

export const COLLECTION_BY_SLUG_QUERY = defineQuery(`
  *[_type == "collection" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    published,
    hero${RICH_IMAGE_SELECTION},
    lines[]{
      label,
      value,
      link
    },
    intro${RICH_TEXT_SELECTION},
    seo{
      title,
      description,
      image${RICH_IMAGE_SELECTION}
    },
    releases[]{
      ...,
      _type == "reference" => @->{
        _id,
        title,
        slug,
        release_date,
        published,
        cover${RICH_IMAGE_SELECTION},
        coverAlt${RICH_IMAGE_SELECTION},
        intro,
        quote,
        embed
      }
    },
    press[]{
      ...${PRESS_ITEM_SELECTION}
    }
  }
`);

export const PROJECT_SLUGS_QUERY = defineQuery(`
  *[_type == "project" && defined(slug.current)]{
    "slug": slug.current
  }
`);

export const PAGE_SLUGS_QUERY = defineQuery(`
  *[_type == "page" && defined(slug.current)]{
    "slug": slug.current
  }
`);

export const PAGE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    body${RICH_TEXT_SELECTION},
    seo{
      title,
      description,
      image${RICH_IMAGE_SELECTION}
    }
  }
`);

const PROJECT_COLUMNS_SELECTION = /* groq */ `[]{
  _key,
  content${RICH_TEXT_SELECTION}
}`;

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project"] | order(_createdAt desc){
    _id,
    title,
    slug,
    lines[]{
      label,
      value,
      link
    },
    columns${PROJECT_COLUMNS_SELECTION},
    gallery[]{
      ...${RICH_IMAGE_SELECTION}
    },
    images[]{
      ...${RICH_IMAGE_SELECTION}
    },
    press[]{
      ...${PRESS_ITEM_SELECTION}
    }
  }
`);

/** Interviews for Reclus listings, newest first. */
export const PUBLISHED_INTERVIEWS_QUERY = defineQuery(`
  *[_type == "interview" && defined(slug.current)] | order(release_date desc){
    _id,
    title,
    slug,
    published,
    release_date,
    authorInitials,
    quote,
    backgroundColor,
    cover${RICH_IMAGE_SELECTION},
    "contributors": authors[]->{ name }
  }
`);

export const PROJECT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    lines[]{
      label,
      value,
      link
    },
    seo{
      title,
      description,
      image${RICH_IMAGE_SELECTION}
    },
    columns${PROJECT_COLUMNS_SELECTION},
    gallery[]{
      ...${RICH_IMAGE_SELECTION}
    },
    images[]{
      ...${RICH_IMAGE_SELECTION}
    },
    press[]{
      ...${PRESS_ITEM_SELECTION}
    }
  }
`);

export type {
  HOMEPAGE_QUERYResult,
  ABOUT_QUERYResult,
  SITE_SETTINGS_QUERYResult,
  RELEASE_SLUGS_QUERYResult,
  RELEASES_QUERYResult,
  CLUB_EDEN_RELEASES_QUERYResult,
  CLUB_EDEN_DOCUMENT_QUERYResult,
  RECLUS_DOCUMENT_QUERYResult,
  RELEASE_BY_SLUG_QUERYResult,
  INTERVIEW_SLUGS_QUERYResult,
  INTERVIEW_BY_SLUG_QUERYResult,
  COLLECTION_SLUGS_QUERYResult,
  CLUB_EDEN_COLLECTION_SLUGS_QUERYResult,
  COLLECTIONS_QUERYResult,
  COLLECTION_BY_SLUG_QUERYResult,
  PROJECT_SLUGS_QUERYResult,
  PROJECTS_QUERYResult,
  PROJECT_BY_SLUG_QUERYResult,
  PUBLISHED_INTERVIEWS_QUERYResult
} from "../types/sanity.generated";
