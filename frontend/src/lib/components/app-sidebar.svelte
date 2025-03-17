<script lang="ts">
  import Volleyball from "lucide-svelte/icons/volleyball";
  import { House, LogOut, User } from "lucide-svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  const items = [
    {
      title: "Home",
      url: "/",
      icon: House,
    },
    {
      title: "Fixtures",
      url: "/fixtures",
      icon: Volleyball,
    },
  ];

  const props = $props();
  let user = $state(props.user);
</script>

<Sidebar.Root>
  <Sidebar.Header>
    <div>
      <a href="/">
        <div class="flex items-center space-x-2">
          <House />
          <div>Football App</div>
        </div>
      </a>
    </div>
    {#if user}
      <div
        class="flex items-center space-x-4 border-t border-b border-black p-2"
      >
        <div>
          <User class="border border-black rounded-full p-1" />
        </div>
        <div>{user}</div>
        <div>
          <button
            onclick={() => {
              user = null;
              window.location.href = "/logout";
            }}
          >
            <LogOut class="border border-black rounded-full p-1" />
          </button>
        </div>
      </div>
    {/if}
  </Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each items as item (item.title)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton>
                {#snippet child({ props })}
                  <a href={item.url} {...props}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
</Sidebar.Root>
