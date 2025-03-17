import { type Instance, type SignalData } from "simple-peer";

export type VideoWindowProps = {
  peer: Instance;
};

export type PeerRef = {
  peerID: string;
  peer: Instance;
};

export type SignalPayload = {
  userToSignal: string;
  signal: SignalData;
  callerID: string;
};

export type RetSignalPayload = {
  signal: SignalData;
  id: string;
};

export type JoinPayload = {
  signal: SignalData;
  callerID: string;
};
