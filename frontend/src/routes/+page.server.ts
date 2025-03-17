import { redirect, type ServerLoadEvent } from "@sveltejs/kit";

export const load = (event: ServerLoadEvent) => {
  const user = event.locals.user;

  if (!user) {
    redirect(302, "/login");
  }
  redirect(302, "/standings");
};
