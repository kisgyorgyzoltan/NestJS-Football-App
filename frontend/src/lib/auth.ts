import { redirect } from "@sveltejs/kit";

export const checkLoggedIn = async (
  locals: App.Locals,
  authorizationToken: string | undefined
) => {
  const user = locals.user;

  if (!user) {
    redirect(302, "/login");
  }

  if (!authorizationToken) {
    redirect(302, "/login");
  }
};
