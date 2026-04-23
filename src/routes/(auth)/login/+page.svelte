<script lang="ts">
  import Button from '$lib/client/components/Button.svelte';
  import Input from '$lib/client/components/Input.svelte';
  import { onMount } from 'svelte';

  // State Declaration
  let showPassword = $state(false);
  let usernameList = $state(['john_doe', 'jane_smith', 'alice_wonder']);
  let isCapsLockOn = $state(false);

  // Event Handlers
  function checkCapsLock(event: KeyboardEvent) {
    isCapsLockOn = event.getModifierState('CapsLock');
  }

  // Lifecycle Hooks
  onMount(() => {
    window.addEventListener('keydown', checkCapsLock);
    window.addEventListener('keyup', checkCapsLock);
    return () => {
      window.removeEventListener('keydown', checkCapsLock);
      window.removeEventListener('keyup', checkCapsLock);
    };
  });
</script>

<section class="flex h-dvh items-center justify-center p-5">
  <div
    class="h-136 w-4xl flex-row divide-y-2 rounded border-2 bg-orange-950 *:flex-1 md:flex md:divide-x-2"
  >
    <div class="hidden md:block">
      <img
        class="h-full w-full object-cover"
        src="https://static.vecteezy.com/system/resources/thumbnails/060/843/811/small/close-up-of-raindrops-on-leaves-hd-background-luxury-hd-wallpaper-image-trendy-background-illustration-free-photo.jpg"
        alt=""
      />
    </div>
    <div>
      <div class="p-5 md:p-10">
        <form action="">
          <h2 class="mb-5 text-center text-xl">Login</h2>
          <Input
            label="Username"
            prefixIcon="user"
            className="not-last:mb-5"
            labelBg="bg-orange-950"
            options={usernameList}
            autofocus
          />
          <Input
            label="Password"
            prefixIcon="keyRound"
            suffixIcon={showPassword ? 'eye' : 'eyeOff'}
            onSuffixClick={() => (showPassword = !showPassword)}
            labelBg="bg-orange-950"
            type={showPassword ? 'text' : 'password'}
            acceptCustomValue={true}
          />

          {#if isCapsLockOn}
            <p class="mb-3 text-amber-500">Capse Lock is on</p>
          {/if}

          <div class="flex justify-center gap-3">
            <Button color="green">Login</Button>
            <Button color="gray">Forget Password</Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
