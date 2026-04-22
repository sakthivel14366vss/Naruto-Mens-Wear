<script>
  import Button from '$lib/client/components/Button.svelte';
  import Input from '$lib/client/components/Input.svelte';
</script>

<section class="flex h-dvh items-center justify-center p-5">
  <div
    class="h-136 w-4xl flex-row divide-y-2 rounded border-2 bg-gray-950 *:flex-1 md:flex md:divide-x-2"
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
        <h2 class="mb-5 text-center text-xl">Login</h2>
        <Input
          label="User"
          prefixIcon="user"
          className="not-last:mb-5"
          labelBg="bg-gray-950"
          autofocus
        />
        <Input label="Password" prefixIcon="keyRound" suffixIcon="eyeOff" labelBg="bg-gray-950" />
        <div class="flex justify-center gap-3">
          <Button color="green">Login</Button>
          <Button>Forget Password</Button>
        </div>
      </div>
    </div>
  </div>
</section>
