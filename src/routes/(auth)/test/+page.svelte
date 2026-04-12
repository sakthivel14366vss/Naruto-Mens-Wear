<script lang="ts">
  import Input from '$lib/client/components/Input.svelte';
</script>

<section class="w-md border border-red-500 p-5">
  <Input value="" label="Username" prefixIcon="user" />
  <Input value="" label="Password" prefixIcon="keyRound" suffixIcon="eyeOff" />
</section>
