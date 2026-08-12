// Env-driven analytics IDs. Components read these to decide whether to inject
// the GA4 / Meta Pixel scripts. Both are optional — blank = disabled.

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

export const hasGA4 = GA4_ID.length > 0;
export const hasMetaPixel = META_PIXEL_ID.length > 0;
