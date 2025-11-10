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
  }
}`;

const MENU_ITEM_SELECTION = /* groq */ `{
  _key,
  label,
  linkType,
  internalLink->{
    _type,
    _id,
    title,
    slug
  },
  externalLink
}`;

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

export const HOMEPAGE_QUERY = defineQuery(`
  *[_type == "homepage"][0]{
    title,
    videos[]{
      ...,
      asset->{
        _id,
        playbackId,
        status,
        data
      }
    },
    seo{
      title,
      description,
      image${RICH_IMAGE_SELECTION}
    }
  }
`);

export const ABOUT_QUERY = defineQuery(`
  *[_type == "about"][0]{
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

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0]{
    mainMenu[]{
      ...${MENU_ITEM_SELECTION}
    },
    footerMenu[]{
      ...${MENU_ITEM_SELECTION}
    },
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

export const RELEASE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "release" && slug.current == $slug][0]{
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
`);

export const COLLECTION_SLUGS_QUERY = defineQuery(`
  *[_type == "collection" && defined(slug.current)]{
    "slug": slug.current
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
  RELEASE_BY_SLUG_QUERYResult,
  COLLECTION_SLUGS_QUERYResult,
  COLLECTIONS_QUERYResult,
  COLLECTION_BY_SLUG_QUERYResult,
  PROJECT_SLUGS_QUERYResult,
  PROJECTS_QUERYResult,
  PROJECT_BY_SLUG_QUERYResult
} from "../types/sanity.generated";
