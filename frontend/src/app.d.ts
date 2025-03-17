// See https://svelte.dev/docs/kit/types#app.d.ts

import type { FootballData } from "$lib/types/data.types";
import type { User } from "$lib/types/user.types";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: {
        userId: string | number | undefined | null;
        username: string | undefined | null | unknown;
      } | null;
    }
    interface PageData {
      data: FootballData;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
