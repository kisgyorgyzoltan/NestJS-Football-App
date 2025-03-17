import { API_URL } from "$lib/config";
import type { UserResponse } from "$lib/types/user.types";
import { fail, redirect } from "@sveltejs/kit";
import type { User } from "lucide-svelte";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async (event) => {
    const formData = Object.fromEntries(await event.request.formData());

    if (!formData.username || !formData.password) {
      console.error("Missing username or password");
      return fail(400, {
        error: "Missing username or password",
      });
    }

    const user = formData as User;

    const resp: Response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    // If there was an error, return an invalid response
    if (resp.status < 200 || resp.status >= 300) {
      console.error("Failed to register user");
      return fail(500, {
        error: "Internal server error",
      });
    }

    redirect(302, "/login");
  },
};
