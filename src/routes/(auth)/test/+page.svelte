<script lang="ts">
  import Input from '$lib/client/components/Input.svelte';

  type Option = {
    name: string;
    value: string;
  };

  const options: Option[] = [
    { name: 'Seeni', value: 'seenivasan' },
    { name: 'Vasan', value: 'vasanAdsk' },
  ];

  const optionstring: string[] = ['Seeni', 'Vasan'];
</script>

<section class="w-md border border-red-500 p-5">
  <Input value="" label="Username" prefixIcon="user" caseMode="title" {options} />
  <Input
    value=""
    label="Password"
    prefixIcon="keyRound"
    suffixIcon="eyeOff"
    options={optionstring}
  />
</section>
