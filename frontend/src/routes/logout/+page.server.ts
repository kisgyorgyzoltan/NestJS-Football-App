import { redirect, type ServerLoadEvent } from "@sveltejs/kit";

export const load = async (event: ServerLoadEvent) => {
  event.locals.user = null;
  event.cookies.delete("AuthorizationToken", {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "none",
  });
  // console.log("setting userStore.user to null");

  redirect(302, "/login");
};
