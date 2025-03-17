<script lang="ts">
  import { Contexts } from "$lib/contexts";
  import type { NotificationSocket } from "$lib/sockets/notification-socket";
  import { getContext } from "svelte";

  const notificationSocket: NotificationSocket = getContext(
    Contexts.NotificationSocket
  );
  notificationSocket.disconnect();
</script>
