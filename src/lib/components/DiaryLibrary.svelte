
<script>
  import { Plus, Search, Lock, Heart } from 'lucide-svelte';

  let {
    diaries = [],
    onCreate = () => {},
    onOpen = () => {}
  } = $props();

  let search = $state('');
  let filter = $state('All');

  let visible = $derived(
    diaries.filter(
      (d) =>
        (filter === 'All' ||
          (filter === 'Personal'
            ? d.members.length === 1
            : d.members.length > 1)) &&
        `${d.name} ${d.description}`
          .toLowerCase()
          .includes(search.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name))
  );
</script>

<div class="max-w-6xl mx-auto">
  <div class="flex flex-wrap items-end justify-between gap-4 mb-9">
    <div>
      <p class="uppercase text-[11px] tracking-[.25em] muted mb-3">
        Your private collection
      </p>

      <h1 class="serif text-4xl md:text-5xl">
        A Library of Us.
      </h1>

      <p class="muted mt-3 text-sm">
        Every connection has a story worth keeping.
      </p>
    </div>

    <button
      class="btn primary flex items-center gap-2"
      onclick={onCreate}
    >
      <Plus size={17} />
      New Diary
    </button>
  </div>

  <div class="flex flex-wrap gap-2 mb-6 items-center">
    <div class="relative flex-1 min-w-48 max-w-sm">
      <Search
        size={16}
        class="absolute left-3 top-3.5 text-[#a6a0a0]"
      />

      <input
        class="field w-full !pl-11"
        placeholder="Search diaries..."
        bind:value={search}
      />


    </div>

    {#each ['All', 'Shared', 'Personal'] as f}
      <button
        class="chip"
        class:active={filter === f}
        onclick={() => (filter = f)}
      >
        {f}
      </button>
    {/each}
  </div>

  <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
    {#each visible as d (d.id)}
      <button
        class="text-left card-hover relative overflow-hidden rounded-2xl border border-[#3c353a] h-64 cover"
        style={`background-image:linear-gradient(0deg,rgba(9,9,12,.95),rgba(9,9,12,.10)),${d.cover ? `url('${d.cover}')` : `linear-gradient(125deg,${d.accent}70,#222127 72%)`}`}
        onclick={() => onOpen(d.id)}
      >
        <div class="absolute inset-0 p-6 flex flex-col justify-between">
          <div class="flex justify-between">
            <span
              class="text-[11px] px-3 py-1 rounded-full bg-black/40 border border-white/20"
            >
              {d.kind}
            </span>

            {#if d.members.length === 1}
              <Lock size={18} />
            {:else}
              <Heart
                size={18}
                fill={d.accent}
                color={d.accent}
              />
            {/if}
          </div>

          <div>
            <h2 class="serif text-2xl mb-2">
              {d.name}
            </h2>

            <p class="text-xs text-[#d1c6c6] mb-4">
              {d.description || 'Your story starts here.'}
            </p>

            <div
              class="border-t border-white/20 pt-3 text-xs text-[#d1c6c6] flex justify-between"
            >
              <span>{d.members.join(' & ')}</span>
              <span>{d.entries.length} entries →</span>
            </div>
          </div>
        </div>
      </button>
    {/each}

    <button
      class="rounded-2xl border border-dashed border-[#51474c] h-64 flex flex-col justify-center items-center gap-3 hover:bg-[#1b1a1d]"
      onclick={onCreate}
    >
      <Plus size={28} color="#dca9a6" />

      <span class="serif text-xl">
        Create a new diary
      </span>

      <span class="text-xs muted">
        As many stories as you want.
      </span>
    </button>
  </div>
</div>
