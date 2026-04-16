<script>
  import Input from '$lib/client/components/Input.svelte';
</script>

<section class="flex h-dvh items-center justify-center">
  <div class="flex h-136 w-4xl divide-x-2 rounded border-2 *:flex-1">
    <div></div>
    <div>
      <div class="p-10">
        <h2 class="mb-5 text-center text-xl">Login</h2>
        <Input label="User" prefixIcon="user" className="not-last:mb-5" />
        <Input label="Password" prefixIcon="keyRound" suffixIcon="eyeOff" />
        <button>Login</button>
        <button>Forget</button>
      </div>
    </div>
  </div>
</section>
