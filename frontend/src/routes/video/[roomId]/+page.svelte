<script lang="ts">
  import type { PageData } from "./$types";
  import { io, Socket } from "socket.io-client";
  import Peer from "simple-peer";
  import VideoWindow from "$lib/components/video-window.svelte";
  import type {
    JoinPayload,
    PeerRef,
    RetSignalPayload,
  } from "$lib/types/video.types";
  import { VideoEvents } from "$lib/events/video";
  import { toast } from "svelte-sonner";

  let { data }: { data: PageData } = $props();
  let roomId = $state(data.roomId);

  let peers: Peer.Instance[] = $state([]);
  let peersRef: PeerRef[] = $state([]);
  let socketRef: Socket = $state(
    io("http://localhost:8080/video", {
      transports: ["websocket"],
    })
  );
  let userVideo: HTMLVideoElement | null = $state(null);

  $effect(() => {
    const videoConstraints = {
      width: { exact: 300 },
      height: { exact: 300 },
    };

    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        if (userVideo) {
          userVideo.srcObject = stream;
          socketRef.emit(VideoEvents.JOIN_ROOM, roomId);
          socketRef.on(VideoEvents.ALL_USERS, (users: string[]) => {
            const allPeers: Peer.Instance[] = [];
            users.forEach((userID: string) => {
              if (userID && socketRef.id) {
                const peer = createPeer(userID, socketRef.id, stream);
                peersRef.push({
                  peerID: userID,
                  peer,
                });
                allPeers.push(peer);
              } else {
                console.error("userID or socketRef.id is undefined");
              }
            });
            peers = allPeers;
          });

          socketRef.on(VideoEvents.USER_JOINED, (payload: JoinPayload) => {
            const peer = addPeer(payload.signal, payload.callerID, stream);
            peersRef.push({
              peerID: payload.callerID,
              peer,
            });

            peers = [...peers, peer];
          });

          socketRef.on(VideoEvents.USER_LEFT, (id: string) => {
            const peerObj = peersRef.find((p) => p.peerID === id);
            if (peerObj) {
              peerObj.peer.destroy();
              peersRef = peersRef.filter((p) => p.peerID !== id);
              peers = peers.filter((p) => p.destroyed !== true);
              toast(`User with ID ${id} left the room`);
              location.reload();
            }
          });

          socketRef.on(
            VideoEvents.RECEIVED_RETURNED_SIGNAL,
            (payload: RetSignalPayload) => {
              const item = peersRef.find((p) => p.peerID === payload.id);
              if (item) {
                item.peer.signal(payload.signal);
              } else {
                console.error(`Peer with ID ${payload.id} not found`);
              }
            }
          );
        }
      });

    return () => {
      socketRef.disconnect();
    };
  });

  function createPeer(
    userToSignal: string,
    callerID: string,
    stream: MediaStream
  ) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.emit(VideoEvents.SENDING_SIGNAL, {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(
    incomingSignal: Peer.SignalData,
    callerID: string,
    stream: MediaStream
  ) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.emit(VideoEvents.RETURNING_SIGNAL, { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }
</script>

<div class="flex p-5 h-screen w-11/12 m-auto flex-wrap">
  <div>
    <video bind:this={userVideo} muted autoplay playsinline class="h-5/6 w-5/6"
    ></video>
  </div>
  {#each peers as peer}
    {#if peer}
      <VideoWindow {peer} />
    {/if}
  {/each}
</div>
