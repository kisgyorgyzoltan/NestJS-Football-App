<script lang="ts">
  import type { VideoWindowProps } from "$lib/types/video.types";
  import { Button } from "./ui/button";
  import { MicOff, Mic } from "lucide-svelte";

  const props: VideoWindowProps = $props();
  let peer = $state(props.peer);
  let videoRef: HTMLVideoElement | null = $state(null);
  let muted = $state(false);

  $effect(() => {
    if (!peer) return;
    peer.on("stream", (stream) => {
      if (videoRef) {
        videoRef.srcObject = stream;
        videoRef.muted = muted;
      }
    });
  });
</script>

<div class="relative">
  <!-- svelte-ignore a11y_media_has_caption -->
  <video bind:this={videoRef} autoplay playsinline class="h-5/6 w-5/6 z-10">
  </video><Button
    class="absolute bottom-12 right-16
     z-50"
    id="muteButton"
    onclick={() => {
      muted = !muted;
      if (videoRef) {
        videoRef.muted = muted;
      }
    }}
  >
    {#if muted}
      <MicOff size={24} />
    {:else}
      <Mic size={24} />
    {/if}
  </Button>
</div>
