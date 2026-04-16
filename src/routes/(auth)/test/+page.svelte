<!-- src\routes\(auth)\test\+page.svelte -->
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
</script>

<section class="w-lg border border-red-500 p-5">
  <Input label="User" prefixIcon="user" options={optionstring} />
  <Input label="Password" prefixIcon="keyRound" suffixIcon="eyeOff" options={optionstring} />
</section>
