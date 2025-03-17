export const load = async ({ locals }) => {
  const user = locals.user;
  return { username: user?.username as string, userId: user?.userId as number };
};
