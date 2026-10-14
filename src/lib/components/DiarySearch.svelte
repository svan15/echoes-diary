
<script>
  import { Search, X, CalendarDays, Image as ImageIcon } from 'lucide-svelte';

  let { diary } = $props();

  let query = $state('');
  let filter = $state('all');
  let openedEntry = $state(null);

  let entries = $derived(
    [...(diary?.entries ?? [])]
      .filter((entry) =>
        entry.type === 'shared' ||
        entry.author === 'You' ||
        (entry.type === 'personal' && entry.visibility === 'shared')
      )
      .sort((a, b) => b.date.localeCompare(a.date))
  );

  let results = $derived(
    entries.filter((entry) => {
      const term = query.trim().toLowerCase();

      const matchesText =
        !term ||
        [entry.title, entry.body, entry.author]
          .some((value) => String(value ?? '').toLowerCase().includes(term));

      const matchesFilter =
        filter === 'all' ||
        (filter === 'shared' && entry.type === 'shared') ||
        (filter === 'personal' && entry.type === 'personal' && entry.author === 'You') ||
        (filter === 'published' && entry.type === 'personal' && entry.author !== 'You');

      return matchesText && matchesFilter;
    })
  );
</script>

<div class="max-w-5xl mx-auto space-y-7 mt-8">
  <div>
    <p class="text-xs uppercase tracking-[.22em] muted mb-2">
      Find a moment
    </p>
    <h2 class="serif text-4xl">Search Memories</h2>
    <p class="muted text-sm mt-2">
      Every story deserves to be remembered.
    </p>
  </div>

  <div class="panel p-5 md:p-7 space-y-5">
    <div class="relative">
      <Search
        size={19}
        class="absolute left-4 top-1/2 -translate-y-1/2 text-[#a99a9d]"
      />
      <input
        class="field w-full pl-12"
        type="search"
        placeholder="Search titles, memories, or authors..."
        bind:value={query}
      />
    </div>

    <div class="flex flex-wrap gap-2">
      {#each [
        { id: 'all', label: 'All Entries' },
        { id: 'shared', label: 'Shared Timeline' },
        { id: 'personal', label: 'My Journal' },
        { id: 'published', label: 'Their Journals' }
      ] as option}
        <button
          class="chip"
          class:active={filter === option.id}
          onclick={() => filter = option.id}
        >
          {option.label}
        </button>
      {/each}
    </div>

    <p class="text-xs muted">
      {results.length} {results.length === 1 ? 'entry' : 'entries'} found
    </p>
  </div>

  {#if results.length}
    <div class="space-y-4">
      {#each results as entry (entry.id)}
        <button
          type="button"
          class="panel p-6 w-full text-left block hover:border-[#b9918c] transition-colors"
          onclick={() => openedEntry = entry}
        >
          <div class="flex flex-wrap gap-3 items-center text-xs muted">
            <CalendarDays size={14} />
            <span>{entry.date}</span>
            <span>· {entry.author}</span>
            {#if entry.photos?.length}
              <span class="flex items-center gap-1">
                <ImageIcon size={14} />
                {entry.photos.length}
              </span>
            {/if}
          </div>

          <h3 class="serif text-2xl mt-3">{entry.title}</h3>

          <p class="text-sm text-[#ded4d1] mt-3 line-clamp-3 whitespace-pre-wrap">
            {entry.body}
          </p>
        </button>
      {/each}
    </div>
  {:else}
    <div class="panel p-12 text-center">
      <Search size={30} class="mx-auto mb-4" />
      <h3 class="serif text-2xl">No matching memories</h3>
      <p class="muted text-sm mt-2">
        Try another search or change your filters.
      </p>
    </div>
  {/if}
</div>

{#if openedEntry}
  <div
    class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
    role="presentation"
  >
    <div class="panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-9">
      <div class="flex justify-between gap-4 items-start">
        <div>
          <p class="muted text-xs">{openedEntry.date} · {openedEntry.author}</p>
          <h2 class="serif text-3xl mt-3">{openedEntry.title}</h2>
        </div>

        <button
          type="button"
          class="btn"
          aria-label="Close entry"
          onclick={() => openedEntry = null}
        >
          <X size={19} />
        </button>
      </div>

      <p class="text-sm leading-7 whitespace-pre-wrap mt-6 text-[#ded4d1]">
        {openedEntry.body}
      </p>

      {#if openedEntry.photos?.length}
        <div class="grid grid-cols-2 gap-3 mt-6">
          {#each openedEntry.photos as photo, index}
            <img
              src={photo}
              alt={`Photo ${index + 1} from ${openedEntry.title}`}
              class="w-full rounded-xl object-cover"
            />
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
