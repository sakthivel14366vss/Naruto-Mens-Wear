<script lang="ts">
  import Input from '$lib/client/components/Input.svelte';
  const optionstring: string[] = [
    'Seeni',
    'Vasan',
    'Sakthi',
    'Siva',
    'Sundar',
    'Sankar',
    'Vijay',
    'Vignesh',
    'Vimal',
    'Vishnu',
  ];

  let vall = $state('');
</script>

<section class="flex w-md border border-red-500 p-5">
  <Input
    bind:value={vall}
    label="Password"
    prefixIcon="keyRound"
    suffixIcon="eyeOff"
    options={optionstring}
  />
  <div class="m-3">{vall}</div>
</section>
