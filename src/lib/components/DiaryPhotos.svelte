
<script>
  import { Images, X, CalendarDays } from 'lucide-svelte';

  let { diary } = $props();
  let selectedPhoto = $state(null);

  let photos = $derived(
    (diary?.entries ?? [])
      .filter((entry) =>
        entry.type === 'shared' ||
        entry.author === 'You' ||
        (entry.type === 'personal' && entry.visibility === 'shared')
      )
      .flatMap((entry) =>
        (entry.photos ?? []).map((src, index) => ({
          id: `${entry.id}-${index}`,
          src,
          title: entry.title,
          date: entry.date,
          author: entry.author
        }))
      )
      .sort((a, b) => b.date.localeCompare(a.date))
  );
</script>

<div class="max-w-5xl mx-auto space-y-8 mt-8">
  <div class="flex flex-wrap justify-between items-end gap-4">
    <div>
      <p class="text-xs uppercase tracking-[.22em] muted mb-2">
        Moments captured
      </p>
      <h2 class="serif text-4xl">Our Photo Gallery</h2>
      <p class="muted text-sm mt-2">
        Every picture holds a little piece of our story.
      </p>
    </div>

    <div class="text-xs muted flex items-center gap-2">
      <Images size={16} />
      {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
    </div>
  </div>

  {#if photos.length}
    <div class="columns-2 md:columns-3 gap-4">
      {#each photos as photo (photo.id)}
        <button
          type="button"
          class="block w-full mb-4 break-inside-avoid text-left group"
          onclick={() => selectedPhoto = photo}
        >
          <div class="relative overflow-hidden rounded-xl border border-[#40383c]">
            <img
              src={photo.src}
              alt={photo.title}
              loading="lazy"
              class="w-full h-auto transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <p class="text-sm mt-2 truncate">{photo.title}</p>
          <p class="text-xs muted mt-1">{photo.date}</p>
        </button>
      {/each}
    </div>
  {:else}
    <div class="panel p-12 md:p-20 text-center">
      <Images size={34} class="mx-auto mb-5" />
      <h3 class="serif text-2xl">No photos yet</h3>
      <p class="muted text-sm mt-3 max-w-sm mx-auto">
        Photos you attach to diary entries will appear here.
        Your gallery begins with your own memories.
      </p>
    </div>
  {/if}
</div>

{#if selectedPhoto}
  <div
    class="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-5"
    role="presentation"
  >
    <button
      type="button"
      aria-label="Close photo"
      class="absolute top-5 right-5 text-white p-3 rounded-full bg-white/10"
      onclick={() => selectedPhoto = null}
    >
      <X size={22} />
    </button>

    <img
      src={selectedPhoto.src}
      alt={selectedPhoto.title}
      class="max-w-full max-h-[75vh] object-contain rounded-lg"
    />

    <div class="text-center mt-5">
      <h3 class="serif text-2xl text-white">{selectedPhoto.title}</h3>
      <p class="text-sm text-gray-400 mt-2 flex items-center justify-center gap-2">
        <CalendarDays size={15} />
        {selectedPhoto.date} · {selectedPhoto.author}
      </p>
    </div>
  </div>
{/if}
