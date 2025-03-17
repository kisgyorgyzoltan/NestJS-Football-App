import { redirect } from "@sveltejs/kit";

export const csr = true;
export const ssr = false;

export const load = async ({ params }) => {
  if (params?.roomId.length > 0) {
    return {
      roomId: params.roomId,
    };
  }
  redirect(404, "/404");
};
