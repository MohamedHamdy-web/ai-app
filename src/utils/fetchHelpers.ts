export async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let errorCode = "";

    if (contentType.includes("application/json")) {
      const errorData = (await response.json()) as {
        error?: string;
        message?: string;
      };
      errorCode = errorData.error ?? "";
      message = errorData.message || errorData.error || message;
    } else {
      const errorText = await response.text();
      message = errorText || message;
    }

    const error = new Error(message) as Error & { code?: string };
    error.code = errorCode;
    throw error;
  }

  if (!contentType.includes("application/json")) {
    const preview = (await response.text()).slice(0, 120);
    throw new Error(`Expected JSON response, received: ${preview}`);
  }

  return (await response.json()) as T;
}
