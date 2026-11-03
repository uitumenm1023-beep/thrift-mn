"use client";

import { ErrorContent } from "@/components/layout/error-content";

export default function PublicError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorContent {...props} />;
}
