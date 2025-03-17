<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import "../app.css";
  import { setContext } from "svelte";
  import type { UserContext } from "$lib/types/user.types";
  import { io } from "socket.io-client";
  import { toast, Toaster } from "svelte-sonner";
  import { Volleyball } from "lucide-svelte";
  import { NotificationEvents } from "$lib/events/notification";
  import type { Match } from "$lib/types/football.types";
  import type { NotificationContext } from "$lib/types/notification.types";
  import { Contexts } from "$lib/contexts";
  import { NotificationSocket } from "$lib/sockets/notification-socket";

  let { data, children } = $props();

  let user: UserContext = $state({
    username: data.username,
    userId: data.userId,
  });

  setContext(Contexts.User, user);
  let notificationSocket: NotificationSocket = $state(new NotificationSocket());
  let notificationContext: NotificationContext = $state({
    notifications: {},
    subscribeToNotifications: (match: Match) => {
      const matchId = match.eventId.toString();
      notificationSocket.subscribeToNotifications(match);
      notificationContext.notifications[matchId] = true;
      toast(
        `Subscribed to match ${match.homeTeamName} vs ${match.awayTeamName}`,
        {
          duration: 5000,
          icon: Volleyball,
        }
      );
    },
    unsubscribeFromNotifications: (match: Match) => {
      const matchId = match.eventId.toString();
      notificationSocket.unsubscribeFromNotifications(match);
      notificationContext.notifications[matchId] = false;
      toast(
        `Unsubscribed from match ${match.homeTeamName} vs ${match.awayTeamName}`,
        {
          duration: 5000,
          icon: Volleyball,
        }
      );
    },
    handleClick: (match: Match) => {
      const eventId = match.eventId.toString();
      if (notificationContext.notifications[eventId]) {
        notificationContext.unsubscribeFromNotifications(match);
      } else {
        notificationContext.subscribeToNotifications(match);
      }
    },
  });
  setContext(Contexts.Notification, notificationContext);

  $effect(() => {
    notificationSocket.onNotification((data: Match) => {
      toast(
        `Match ${data.homeTeamName} vs ${data.awayTeamName} has been updated`,
        {
          duration: 5000,
          icon: Volleyball,
        }
      );
    });
  });

  setContext(Contexts.NotificationSocket, notificationSocket);
</script>

<Sidebar.Provider>
  <AppSidebar user={data.username} />

  <main>
    <Sidebar.Trigger />
    {@render children?.()}
  </main>
</Sidebar.Provider>
<Toaster />
