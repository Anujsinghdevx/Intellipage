import { handleApiError } from "@/lib/error-handler";
import { logger } from "@/lib/logger";

export const apiErrorMiddleware = (error: unknown) => {
  const handledError = handleApiError(error);

  // Log to external service if needed (e.g., Sentry)
  if (process.env.NEXT_PUBLIC_ENABLE_SENTRY === "true") {
    // Send to Sentry or other error tracking service
    logger.error("API Error logged to external service", handledError);
  }

  return handledError;
};

export const withErrorHandling = async <T>(
  fn: () => Promise<T>
): Promise<{ data?: T; error?: unknown }> => {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    return { error: apiErrorMiddleware(error) };
  }
};
