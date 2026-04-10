export async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (contentType.includes("application/json")) {
      const errorData = (await response.json()) as { error?: string };
      message = errorData.error || message;
    } else {
      const errorText = await response.text();
      message = errorText || message;
    }

    throw new Error(message);
  }

  if (!contentType.includes("application/json")) {
    const preview = (await response.text()).slice(0, 120);
    throw new Error(`Expected JSON response, received: ${preview}`);
  }

  return (await response.json()) as T;
}
