<!-- src\lib\client\components\Input.svelte -->
<script lang="ts" generics="T extends Record<string, unknown> | string">
  import icons, { type IconKey } from '../const/icons';
  import stringCase, { type stringCaseKey } from '$lib/common/utils/stringCase';

  // 1. Define the interface using T
  type ExtractKeys<U> = U extends object ? keyof U : string;
  interface Props {
    type?: string;
    label?: string;
    value: string;
    prefixIcon?: IconKey;
    suffixIcon?: IconKey;
    onPrefixClick?: (e: MouseEvent) => void;
    onSuffixClick?: (e: MouseEvent) => void;
    caseMode?: stringCaseKey;
    options?: T[];
    // Use 'any' here for the default strings to avoid complex conditional types
    labelKey?: ExtractKeys<T>;
    valueKey?: ExtractKeys<T>;
  }

  // Constant Declare
  const emptyFunction = () => {};

  // 2. Destructure from $props<Props>()
  let {
    type = 'text',
    prefixIcon = undefined,
    suffixIcon = undefined,
    label = '',
    value = $bindable(''),
    onPrefixClick = () => {},
    onSuffixClick = () => {},
    caseMode = 'none',
    options = [],
    labelKey = 'name',
    valueKey = 'value',
  }: Props = $props();

  // State Declare
  let isFocused = $state(false);

  // Derived Declare
  let labelActive = $derived(isFocused || value);
  let isOnPrefixClickCallable = $derived(onPrefixClick != emptyFunction);
  let isOnSuffixClickCallable = $derived(onSuffixClick != emptyFunction);

  // Function Declare
  function handleBlur() {
    value = value.trim();
    isFocused = false;
  }

  function handleInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    value = stringCase[caseMode]?.(target.value || '');
  }
</script>

<div
  class="group relative appearance-none items-center rounded border-2 not-last:mb-4
  {isFocused ? 'border-amber-400' : ''}"
>
  <!-- Main Part -->
  <div class="flex divide-x-2 {isFocused ? 'divide-amber-400' : ''}">
    {#if prefixIcon}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="flex items-center justify-center self-stretch px-2 py-1
              {isOnPrefixClickCallable ? 'cursor-pointer border-white hover:text-amber-400' : ''}"
        onclick={onPrefixClick}
      >
        <span class="{icons[prefixIcon]} leading-none"></span>
      </div>
    {/if}

    <div class="relative w-full px-2 py-1">
      {#if label}
        <span
          class="absolute z-10 transition-all {labelActive
            ? 'bottom-full translate-y-1/4 scale-90 bg-black px-1 text-sm'
            : 'bottom-1 translate-y-0 text-base'} {isFocused ? 'text-amber-400' : ''}"
        >
          {label}
        </span>
      {/if}
      <input
        {type}
        bind:value
        class="w-full bg-transparent outline-none"
        onfocus={() => (isFocused = true)}
        onblur={handleBlur}
        oninput={handleInput}
      />
    </div>

    {#if suffixIcon}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="flex items-center justify-center self-stretch px-2 py-1
              {isOnSuffixClickCallable ? 'cursor-pointer border-white hover:text-amber-400' : ''}"
        onclick={onSuffixClick}
      >
        <span class="{icons[suffixIcon]} leading-none"></span>
      </div>
    {/if}
  </div>

  <!-- Options -->
  {#if isFocused}
    <div
      class="absolute z-20 w-full divide-y-2 divide-white/50 rounded-b border-2 border-white bg-gray-900 *:px-2 *:py-1"
    >
      {#each options as option, index (index)}
        <div>{JSON.stringify(option)}</div>
      {/each}
    </div>
  {/if}
</div>
