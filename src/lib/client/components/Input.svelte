<!-- src\lib\client\components\Input.svelte -->
<script lang="ts">
  import icons, { type IconKey } from '../const/icons';
  import stringCase, { type stringCaseKey } from '$lib/common/utils/stringCase';

  // 1. Define the interface using T
  interface Props {
    type?: string;
    label?: string;
    value: string;
    prefixIcon?: IconKey;
    suffixIcon?: IconKey;
    onPrefixClick?: (e: MouseEvent) => void;
    onSuffixClick?: (e: MouseEvent) => void;
    caseMode?: stringCaseKey;
    options?: string[];
    searchMode?: 'includes' | 'startsWith' | 'endsWith';
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
    searchMode = 'startsWith',
  }: Props = $props();

  // State Declare
  let isFocused = $state(false);
  let search = $state('');
  let selectedOption = $state('');

  // Derived Declare
  let labelActive = $derived(isFocused || value);
  let isOnPrefixClickCallable = $derived(onPrefixClick != emptyFunction);
  let isOnSuffixClickCallable = $derived(onSuffixClick != emptyFunction);
  let searchedOptions = $derived(
    options.filter((option) => {
      const optionLower = option.toLocaleLowerCase();
      const searchLower = search.toLocaleLowerCase();
      switch (searchMode) {
        case 'startsWith':
          return optionLower.startsWith(searchLower);
        case 'endsWith':
          return optionLower.endsWith(searchLower);
        case 'includes':
        default:
          return optionLower.includes(searchLower);
      }
    }),
  );
  let canShowOptions = $derived(isFocused && searchedOptions.length > 0 && search.length > 0);

  // Function Declare
  function handleBlur() {
    if (search.length == 0) {
      value = '';
      selectedOption = '';
    } else if (selectedOption.length > 0) {
      value = selectedOption;
    }
    search = selectedOption || value.trim();
    isFocused = false;
  }

  function handleInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    search = stringCase[caseMode]?.(target.value || '');
  }

  function handleClickOption(e: Event, option: string) {
    e.preventDefault();
    selectedOption = option;
    value = option || '';
    search = option;
  }

  async function handleKeydown(e: Event) {
    switch ((e as KeyboardEvent).key) {
      case 'Enter':
        if (canShowOptions && selectedOption) {
          value = selectedOption;
          search = selectedOption;
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (canShowOptions && searchedOptions.length > 0) {
          const currentIndex = searchedOptions.indexOf(selectedOption);
          const nextIndex = (currentIndex + 1) % searchedOptions.length;
          selectedOption = searchedOptions[nextIndex];
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (canShowOptions && searchedOptions.length > 0) {
          const currentIndex = searchedOptions.indexOf(selectedOption);
          const prevIndex = (currentIndex - 1 + searchedOptions.length) % searchedOptions.length;
          selectedOption = searchedOptions[prevIndex];
        }
        break;
    }
  }

  // Effect and Lifecycles
  $effect(() => {
    if (searchedOptions.length > 0) {
      selectedOption = searchedOptions[0];
    } else {
      selectedOption = '';
    }
  });
</script>

<div
  class="group relative appearance-none items-center rounded border-2 not-last:mb-4
  {isFocused ? 'border-amber-400' : ''} {canShowOptions ? 'rounded-b-none' : ''}"
>
  <!-- Main Part -->
  <div class="flex divide-x-2 {isFocused ? 'divide-amber-400' : ''}">
    {#if prefixIcon}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="flex items-center justify-center self-stretch px-2 py-1
              {isOnPrefixClickCallable ? 'cursor-pointer hover:text-amber-400' : ''}"
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
        bind:value={search}
        class="w-full bg-transparent outline-none"
        onfocus={() => (isFocused = true)}
        onblur={handleBlur}
        onkeydown={handleKeydown}
        oninput={handleInput}
      />
    </div>

    {#if suffixIcon}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="flex items-center justify-center self-stretch px-2 py-1
              {isOnSuffixClickCallable ? 'cursor-pointer hover:text-amber-400' : ''}"
        onclick={onSuffixClick}
      >
        <span class="{icons[suffixIcon]} leading-none"></span>
      </div>
    {/if}
  </div>

  <!-- Options -->
  {#if canShowOptions}
    <div
      class="absolute -right-0.5 -left-0.5 z-20 divide-y-2 divide-amber-400/50 rounded-b border-2 border-amber-400 bg-gray-900 *:px-1 *:py-0.5"
    >
      {#each searchedOptions as option, index (index)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class={selectedOption == option ? 'bg-amber-900' : 'hover:bg-amber-950'}
          onmousedown={(e) => handleClickOption(e, option)}
        >
          {option}
        </div>
      {/each}
    </div>
  {/if}
</div>
