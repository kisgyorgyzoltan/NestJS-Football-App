import type { Standing, Round } from "./football.types";

export type FootballData = {
  standing: Standing;
  rounds: Round[];
  currentRound: number;
};
