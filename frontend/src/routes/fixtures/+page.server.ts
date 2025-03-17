import { redirect, type Actions, fail } from "@sveltejs/kit";
import { API_URL } from "$lib/config.js";
import type { FootballData } from "$lib/types/data.types";
import { checkLoggedIn } from "$lib/auth";

// TODO: Remove client side user checks
export const load = async ({ locals, cookies, fetch }) => {
  const authorizationToken = cookies.get("AuthorizationToken");
  checkLoggedIn(locals, authorizationToken);

  try {
    const response = await fetch(`${API_URL}/api/football-data`, {
      headers: {
        // Authorization: `${authorizationToken ?? ""}`,
      },
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const footballData: FootballData = await response.json();
    return footballData;
  } catch (error) {
    console.error(error);
  }
};

export const actions = {
  chat: async ({ request, fetch }) => {
    try {
      const matchId = (await request.formData()).get("matchId");
      if (!matchId) {
        console.error("missing matchId");
        fail(400, {
          error: "Missing matchId",
        });
      }

      // console.log("chat action called", matchId);
      const [result1, result2] = await Promise.all([
        fetch(`${API_URL}/api/chat/votes/${matchId}`),
        fetch(`${API_URL}/api/chat/messages/${matchId}?threshold=10`),
      ]);

      const [votes, messages] = await Promise.all([
        result1.json(),
        result2.json(),
      ]);

      console.log("votes SERVER", votes);

      return { votes, messages };
    } catch (error) {
      console.error(error);
      fail(500, {
        error: "Internal server error",
      });
    }
  },
} satisfies Actions;
