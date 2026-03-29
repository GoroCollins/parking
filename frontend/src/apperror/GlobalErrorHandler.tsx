import NotFoundImage from "@/assets/notfound.jpg";
import "./ErrorPage.css";
import type { FallbackProps } from "react-error-boundary";

export default function ErrorPage({ error, resetErrorBoundary }: FallbackProps) {
  console.log("An Error occurred:", error);

  return (
    <div className="error-page flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <img
        src={NotFoundImage}
        alt="Oops! Something went wrong"
        className="max-w-sm mb-6"
      />

      <h1 className="text-2xl font-semibold mb-2">
        Oops! Something went wrong
      </h1>

      <p className="text-gray-600 mb-4">
        We couldn’t load your dashboard. Try refreshing the page or come back later.
      </p>

      <button
        className="btn btn-primary px-6 py-2 rounded-lg shadow hover:shadow-md transition"
        onClick={resetErrorBoundary}
      >
        Refresh Page
      </button>

      {/* Debug info only if it's a real Error */}
      {error instanceof Error && (
        <pre className="mt-4 text-sm text-red-500 hidden md:block">
          {error.message}
        </pre>
      )}
    </div>
  );
}
