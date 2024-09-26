export const handleErrorMessage = (error: unknown) => {
  let errorMessage = "An unexpected error occurred.";

  if (error instanceof Error) {
    const networkError = error.message.includes("Failed to fetch");

    if (networkError) {
      errorMessage =
        "Could not establish a connection to the server. Please try again later.";
    } else errorMessage = error.message;
  }

  return errorMessage;
};
