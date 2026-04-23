<!-- src\lib\client\components\Input.svelte -->
<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import icons, { type IconKey } from '../const/icons';
  import stringCase, { type stringCaseKey } from '$lib/common/utils/stringCase';

  // 1. Define the interface using T
  interface Props {
    type?: string;
    label?: string;
    value?: string;
    input?: string;
    prefixIcon?: IconKey;
    suffixIcon?: IconKey;
    optionSnippet?: Snippet<[string, { index: number; isSelected: boolean }]>;
    onPrefixClick?: (e: MouseEvent) => void;
    onSuffixClick?: (e: MouseEvent) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    onKeyUp?: (e: KeyboardEvent) => void;
    caseMode?: stringCaseKey;
    options?: string[];
    searchMode?: 'includes' | 'startsWith' | 'endsWith';
    className?: string;
    labelBg?: string;
    autofocus?: boolean;
    acceptCustomValue?: boolean;
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
    input = $bindable(''),
    onPrefixClick = emptyFunction,
    onSuffixClick = emptyFunction,
    onKeyDown = emptyFunction,
    onKeyUp = emptyFunction,
    caseMode = 'none',
    optionSnippet = undefined,
    options = [],
    searchMode = 'startsWith',
    className = '',
    labelBg = 'black',
    autofocus = false,
    acceptCustomValue = false,
  }: Props = $props();

  // State Declare
  let isFocused = $state(false);
  let search = $state('');
  let selectedOption = $state('');
  let inputRef = $state<HTMLInputElement | undefined>(undefined);

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
    if (search.trim().length == 0) {
      value = '';
      search = '';
      input = '';
    } else {
      if (acceptCustomValue) {
        search = selectedOption ? selectedOption : search;
        value = selectedOption ? selectedOption : search;
        input = selectedOption ? selectedOption : search;
      } else {
        value = selectedOption;
        search = selectedOption;
        input = selectedOption;
      }
    }
    isFocused = false;
  }

  function handleInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    search = stringCase[caseMode]?.(target.value || '');
    input = search;
  }

  function handleClickOption(e: Event, option: string) {
    e.preventDefault();
    selectedOption = option;
    value = option || '';
    search = option;
    input = option;
  }

  async function handleKeydown(e: KeyboardEvent) {
    switch ((e as KeyboardEvent).key) {
      case 'Enter':
        if (canShowOptions && selectedOption) {
          value = selectedOption;
          search = selectedOption;
          input = selectedOption;
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
    onKeyDown(e);
  }

  // Effect and Lifecycles
  $effect(() => {
    if (searchedOptions.length > 0) {
      selectedOption = searchedOptions[0];
    } else {
      selectedOption = '';
    }
  });

  onMount(() => {
    if (autofocus) {
      inputRef?.focus();
    }
  });
</script>

<div
  class="group relative w-full appearance-none items-center rounded-md border-2 not-last:mb-4
  {isFocused ? 'border-amber-400' : ''} {canShowOptions ? 'rounded-b-none' : ''} {className}"
>
  <!-- Main Part -->
  <div class="flex divide-x-2 {isFocused ? 'divide-amber-400' : ''}">
    {#if prefixIcon}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="flex items-center justify-center self-stretch px-2 py-1
              {isOnPrefixClickCallable ? 'cursor-pointer hover:text-amber-400' : ''}
              {isOnPrefixClickCallable && isFocused ? 'border-amber-400' : ''}"
        onclick={onPrefixClick}
      >
        <span class="{icons[prefixIcon]} leading-none"></span>
      </div>
    {/if}

    <div class="relative w-full px-2 py-1">
      {#if label}
        <span
          class="absolute z-10 transition-all {labelActive
            ? 'bottom-full translate-y-1/4 scale-90 px-1 text-sm ' + labelBg
            : 'bottom-1 translate-y-0 text-base'} {isFocused ? 'text-amber-400' : ''}"
        >
          {label}
        </span>
      {/if}
      <input
        {type}
        bind:value={search}
        data-value={input}
        bind:this={inputRef}
        class="w-full bg-transparent outline-none"
        onfocus={() => (isFocused = true)}
        onblur={handleBlur}
        onkeydown={handleKeydown}
        onkeyup={onKeyUp}
        oninput={handleInput}
        autocomplete={type === 'password' ? 'current-password' : 'off'}
      />
    </div>

    {#if suffixIcon}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="flex items-center justify-center self-stretch px-2 py-1
              {isOnSuffixClickCallable ? 'cursor-pointer hover:text-amber-400' : ''}
              {isOnSuffixClickCallable && isFocused ? 'border-amber-400' : ''}"
        onclick={onSuffixClick}
      >
        <span class="{icons[suffixIcon]} leading-none"></span>
      </div>
    {/if}
  </div>

  <!-- Options -->
  {#if canShowOptions}
    <div
      class="absolute -right-0.5 -left-0.5 z-20 overflow-hidden rounded-b-md border-2 border-amber-400 bg-gray-900"
    >
      {#each searchedOptions as option, index (index)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div onmousedown={(e) => handleClickOption(e, option)}>
          {#if optionSnippet}
            <div>
              {@render optionSnippet(option, { index, isSelected: selectedOption == option })}
            </div>
          {:else}
            <div
              class="border-amber-400 px-1 py-0.5
              {index == searchedOptions.length - 1 ? 'border-b-0' : 'border-b-2'}
              {selectedOption == option ? 'bg-amber-900' : 'hover:bg-amber-950'}"
            >
              {option}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
