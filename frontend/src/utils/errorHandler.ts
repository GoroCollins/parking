import axios from "axios";

type ErrorObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is ErrorObject => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const extractFirstError = (value: unknown): string | null => {
  // Case 1: direct string
  if (typeof value === "string") return value;

  // Case 2: array of strings
  if (Array.isArray(value)) {
    const first = value[0];
    if (typeof first === "string") return first;
    return null;
  }

  // Case 3: nested object → recurse
  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      const nested = extractFirstError(value[key]);
      if (nested) return nested;
    }
  }

  return null;
};

export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    // Network / no response
    if (!data) {
      if (error.request) return "Network error. Please check your connection.";
      return error.message || "An unexpected error occurred.";
    }

    // Plain string response
    if (typeof data === "string") {
      return data;
    }

    // Structured object (handles your nested `header.vendor_reference`)
    const nestedError = extractFirstError(data);
    if (nestedError) return nestedError;

    return error.message || "Request failed.";
  }

  if (error instanceof Error) return error.message;

  return "An unknown error occurred.";
};

