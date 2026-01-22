export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends Error {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message);
    this.name = "ValidationError";
  }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    console.error(
      `[API Error ${error.statusCode}] ${error.message}`,
      error.data
    );
    return {
      message: error.message,
      statusCode: error.statusCode,
      data: error.data,
    };
  }

  if (error instanceof ValidationError) {
    console.error("[Validation Error]", error.message, error.fields);
    return {
      message: error.message,
      fields: error.fields,
    };
  }

  if (error instanceof Error) {
    console.error("[Error]", error.message);
    return {
      message: error.message,
    };
  }

  console.error("[Unknown Error]", error);
  return {
    message: "An unknown error occurred",
  };
};
