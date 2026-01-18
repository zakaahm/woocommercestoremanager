import { AuthData } from "../auth-provider";

export async function login(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string
): Promise<AuthData> {
  const token = btoa(`${consumerKey}:${consumerSecret}`);
  return {
    storeUrl,
    type: "woo-rest",
    token,
    consumerKey,
    consumerSecret
  };
}
