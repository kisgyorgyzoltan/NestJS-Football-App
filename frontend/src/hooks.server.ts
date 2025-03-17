import { type Handle, type HandleFetch } from "@sveltejs/kit";
import { parse } from "cookie";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "$lib/config";

export const handle: Handle = async ({ event, resolve }) => {
  // console.log("Handle is called", event.url.pathname);
  const { headers } = event.request;
  const cookies = parse(headers.get("cookie") ?? "");

  if (cookies.AuthorizationToken) {
    const token = cookies.AuthorizationToken.split(" ")[1];

    if (token && token.length > 0) {
      try {
        const encodedSecret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, encodedSecret);

        if (payload.exp && Date.now() >= payload.exp * 1000) {
          console.error("Token expired, clearing user");
          event.locals.user = null;
        } else {
          event.locals.user = {
            userId: payload.sub,
            username: payload.username,
          };
          // console.debug("User verified");
        }
      } catch (error) {
        console.error("Error verifying token, clearing user", error);
        event.locals.user = null;
      }
    }
  } else {
    console.error("No token found, clearing user");
    event.locals.user = null;
  }

  return await resolve(event);
};

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  try {
    // console.debug("HandleFetch is called url", request.url);

    const authorizationToken = event.cookies.get("AuthorizationToken");
    request.headers.set("Authorization", `${authorizationToken ?? ""}`);

    const resp = await fetch(request);
    // console.debug("Response status", resp.status);
    return resp;
  } catch (error) {
    console.error(JSON.stringify(error));
    return new Response("Internal Server Error", { status: 500 });
  }
};
