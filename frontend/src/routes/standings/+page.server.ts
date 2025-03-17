import { checkLoggedIn } from "$lib/auth";
import { API_URL } from "$lib/config.js";
import type { FootballData } from "$lib/types/data.types";
import { type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ locals, cookies, fetch }) => {
  const authorizationToken = cookies.get("AuthorizationToken");
  checkLoggedIn(locals, authorizationToken);

  try {
    const response = await fetch(`${API_URL}/api/football-data`);
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const footballData: FootballData = await response.json();
    return footballData;
  } catch (error) {
    console.error(error);
  }
};
