import NextImage from "next/image";
import type { ComponentProps } from "react";
import { isPreparedUpload, thumbUrl } from "@/lib/storage";

type Props = ComponentProps<typeof NextImage> & {
  /** Use the small thumbnail when the upload has one (cards, lists). */
  thumb?: boolean;
};

/**
 * next/image, except pictures that are already sized are served as-is:
 * bundled demo pictures (/demo/...) and new uploads, which are saved as a
 * full version plus a thumbnail. On-demand resizing would only add a
 * 0.5–1s wait on first view and use up the host's monthly resize quota.
 * Older uploads without a thumbnail still go through the optimizer.
 */
export default function SmartImage({ thumb, ...props }: Props) {
  const src = typeof props.src === "string" ? props.src : null;
  const small = thumb && src ? thumbUrl(src) : null;
  const direct = src !== null && (src.startsWith("/demo/") || isPreparedUpload(src));
  return <NextImage {...props} src={small ?? props.src} unoptimized={props.unoptimized ?? direct} />;
}
