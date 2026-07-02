export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export function getConfigurationHint(error: unknown): string {
  if (error instanceof ConfigurationError) {
    return error.message;
  }

  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Invalid environment configuration")) {
    return "Server environment variables are missing. Set ALAMATRACKS_API_URL and ALAMATRACKS_EVENT_ID in your Vercel project settings, then redeploy.";
  }

  if (message.includes("Event not found")) {
    return "The event ID was not found on the API. The event may only exist locally — use a production event UUID or sync the event to your cloud API.";
  }

  if (message.includes("fetch failed") || message.includes("ECONNREFUSED")) {
    return "Cannot reach the AlamaTracks API. Ensure ALAMATRACKS_API_URL is a public URL (not 127.0.0.1) and the API server is running.";
  }

  if (message.includes("not publicly available")) {
    return "This event's results are not marked as public on the API.";
  }

  return message || "Unable to load results from the API.";
}
