import { buildApiClient } from "../api/client";

export async function testConnection({
  authMethod,
  storeUrl
}: {
  authMethod: string;
  storeUrl: string;
}) {
  if (!authMethod || !storeUrl) throw new Error("Missing info");

  if (authMethod === "woo-rest") {
    const url = new URL(storeUrl);
    url.pathname = "/wp-json/wc/v3/products";
    url.searchParams.set("per_page", "1");
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Verbinding mislukt");
  }

  if (authMethod === "jwt") {
    const url = storeUrl.replace(/\/$/, "") + "/wp-json/wp/v2/users/me";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Verbinding mislukt");
  }
}
