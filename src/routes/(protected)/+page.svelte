<!-- src\routes\(protected)\+page.svelte -->
<script lang="ts">
  import naruto from '$lib/client/assets/naruto1.png';

  const CATEGORIES = [
    { name: 'Shirts', icon: '👔', href: '/inventory/shirts' },
    { name: 'T-Shirts', icon: '👕', href: '/inventory/t-shirts' },
    { name: 'Jeans', icon: '👖', href: '/inventory/jeans' },
    { name: 'Blazers', icon: '🧥', href: '/inventory/blazers' },
    { name: 'Accessories', icon: '⌚', href: '/inventory/accessories' },
  ] as const;
</script>

<svelte:head>
  <title>Dashboard | Naruto Mens Wear</title>
</svelte:head>

<section class="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden">
  <!-- Animated Background Glow -->
  <div
    class="absolute -top-40 -left-40 h-96 w-96 animate-pulse rounded-full bg-orange-800 opacity-30 blur-3xl"
  ></div>
  <div
    class="absolute right-0 bottom-0 h-96 w-96 animate-pulse rounded-full bg-purple-950 opacity-30 blur-3xl"
  ></div>

  <img src={naruto} alt="" class="absolute top-70 left-0 h-auto opacity-50 md:top-auto md:h-dvh" />

  <!-- Content -->
  <div class="z-10 p-5 text-center">
    <h1
      class="bg-linear-to-r from-orange-400 to-purple-400 bg-clip-text text-6xl font-extrabold text-transparent drop-shadow-lg"
    >
      Naruto Mens Wear
    </h1>
    <p class="mt-4 text-xl tracking-wide text-gray-300">
      Manage accounts in a simple and powerful way
    </p>
  </div>

  <!-- Menu Cards -->
  <div class="z-10 mt-14 grid grid-cols-1 gap-6 p-5 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
    {#each CATEGORIES as item, index (index)}
      <div
        class="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:shadow-2xl hover:shadow-orange-500/30"
      >
        <!-- Hover Glow Effect -->
        <div
          class="absolute inset-0 rounded-2xl bg-linear-to-tr from-purple-500/20 to-orange-500/20 opacity-0 transition duration-300 group-hover:opacity-100"
        ></div>

        <div class="z-20 flex flex-col items-center gap-3">
          <span class="text-4xl transition-transform duration-300 group-hover:rotate-12">
            {item.icon}
          </span>
          <span class="z-20 text-lg font-semibold tracking-wide">
            {item.name}
          </span>
        </div>
      </div>
    {/each}
  </div>
</section>
