import { API_URL } from "$lib/config";
import type { UserResponse } from "$lib/types/user.types";
import { fail, redirect } from "@sveltejs/kit";
import type { User } from "lucide-svelte";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request, fetch, cookies }) => {
    const formData = Object.fromEntries(await request.formData());

    if (!formData.username || !formData.password) {
      console.error("missing username or password");
      return fail(400, {
        error: "Missing username or password",
      });
    }

    const user = formData as User;

    const resp: UserResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    const { access_token } = await resp.json();

    if (resp.status < 200 || resp.status >= 300 || !access_token) {
      console.error("failed to login");
      return fail(500, {
        error: "Internal server error",
      });
    }

    cookies.set("AuthorizationToken", `Bearer ${access_token}`, {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none", // required for cross-site cookies
      maxAge: 60 * 60 * 24, // 1 day
    });

    redirect(302, "/standings");
  },
};
