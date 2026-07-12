import * as configcat from "configcat-node";

let client: configcat.IConfigCatClient | null = null;

function getClient() {
  if (!client) {
    client = configcat.getClient(
      process.env.CONFIGCAT_SDK_KEY!,
      configcat.PollingMode.AutoPoll,
      { pollIntervalSeconds: 10 }
    );
  }
  return client;
}

export async function isFeatureEnabled(
  flagKey: string,
  defaultValue = false,
  userId?: string
): Promise<boolean> {
  const user = userId ? new configcat.User(userId) : undefined;
  return getClient().getValueAsync(flagKey, defaultValue, user);
}
