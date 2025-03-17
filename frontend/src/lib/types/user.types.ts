export type User = {
  username: string;
  password: string;
};

export type UserResponse = Response & {
  access_token?: string;
};

export type UserContext = {
  username: string | null;
  userId: number | null;
};
