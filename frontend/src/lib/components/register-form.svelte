<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { enhance } from "$app/forms";
</script>

<Card.Root class="mx-auto max-w-sm">
  <Card.Header>
    <Card.Title class="text-2xl">Register</Card.Title>
    <Card.Description
      >Enter your username below to register to your account</Card.Description
    >
  </Card.Header>
  <Card.Content>
    <form method="POST" action="/register" use:enhance>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="username">Email</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="user123"
            required
          />
        </div>
        <div class="grid gap-2">
          <div class="flex items-center">
            <Label for="password">Password</Label>
            <a href="##" class="ml-auto inline-block text-sm underline">
              Forgot your password?
            </a>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" class="w-full">Login</Button>
      </div>
      <div class="mt-4 text-center text-sm">
        Already have an account?
        <a href="/login" class="underline"> Login </a>
      </div>
    </form>
  </Card.Content>
</Card.Root>
