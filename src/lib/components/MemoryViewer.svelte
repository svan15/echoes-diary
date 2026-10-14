
<script>
  import {
    X,
    ChevronLeft,
    ChevronRight,
    Images,
    Volume2
  } from 'lucide-svelte';

  let {
    entries = [],
    initialIndex = 0,
    accent = '#dca9a6',
    onClose = () => {}
  } = $props();

  let activeIndex = $state(initialIndex);
  let photoIndex = $state(0);

  let memory = $derived(entries[activeIndex]);
  let photos = $derived(memory?.photos ?? []);
  let activePhoto = $derived(photos[photoIndex] ?? null);

  function changeMemory(direction) {
    const next = activeIndex + direction;
    if (next < 0 || next >= entries.length) return;

    activeIndex = next;
    photoIndex = 0;
  }

  function changePhoto(direction) {
    if (!photos.length) return;

    photoIndex =
      (photoIndex + direction + photos.length) % photos.length;
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') onClose();

    if (event.key === 'ArrowLeft') {
      changeMemory(-1);
    }

    if (event.key === 'ArrowRight') {
      changeMemory(1);
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if memory}
  <div
    class="fixed inset-0 z-[150] bg-[#0b0b0d] text-white overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-label={`Viewing ${memory.title}`}
  >
    <!-- Blurred background from the uploaded photo -->
    {#if activePhoto}
      <div class="fixed inset-0 pointer-events-none overflow-hidden">
        <img
          src={activePhoto}
          alt=""
          class="w-full h-full object-cover blur-3xl scale-110 opacity-30"
        />
      </div>
    {:else}
      <div
        class="fixed inset-0 pointer-events-none"
        style={`background:radial-gradient(ellipse at top, ${accent}30, #0b0b0d 70%)`}
      ></div>
    {/if}

    <div class="fixed inset-0 pointer-events-none bg-gradient-to-b from-black/50 via-transparent to-black/70"></div>

    <!-- Top bar -->
    <div class="relative z-10 flex items-center justify-between gap-4 px-5 md:px-10 py-6">
      <div>
        <p class="serif tracking-[.28em] text-lg">ECHOES</p>
        <p class="text-[10px] uppercase tracking-[.2em] text-white/50 mt-1">
          A moment in time
        </p>
      </div>

      <button
        type="button"
        class="rounded-full bg-white/10 hover:bg-white/20 p-3"
        aria-label="Close memory viewer"
        onclick={onClose}
      >
        <X size={21} />
      </button>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-5 md:px-10 pb-12">
      <!-- Main photo -->
      <div class="relative flex items-center justify-center min-h-[35vh] md:min-h-[55vh]">
        {#if activePhoto}
          <img
            src={activePhoto}
            alt={`Photo ${photoIndex + 1} from ${memory.title}`}
            class="max-w-full max-h-[58vh] object-contain rounded-xl shadow-2xl"
          />

          {#if photos.length > 1}
            <button
              type="button"
              class="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3"
              aria-label="Previous photo"
              onclick={() => changePhoto(-1)}
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              class="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3"
              aria-label="Next photo"
              onclick={() => changePhoto(1)}
            >
              <ChevronRight size={22} />
            </button>
          {/if}
        {:else}
          <div class="text-center py-20">
            <p class="serif text-5xl md:text-7xl text-white/25">
              A Memory
            </p>
            <p class="text-white/50 text-sm mt-4">
              Some moments are remembered in words.
            </p>
          </div>
        {/if}
      </div>

      <!-- Photo thumbnails -->
      {#if photos.length > 1}
        <div class="flex justify-center gap-3 mt-5 overflow-x-auto pb-2">
          {#each photos as photo, index}
            <button
              type="button"
              class="w-14 h-14 md:w-18 md:h-18 shrink-0 rounded-lg overflow-hidden border-2"
              class:border-white={index === photoIndex}
              class:border-transparent={index !== photoIndex}
              aria-label={`View photo ${index + 1}`}
              onclick={() => (photoIndex = index)}
            >
              <img
                src={photo}
                alt=""
                class="w-full h-full object-cover"
              />
            </button>
          {/each}
        </div>
      {/if}

      <!-- Memory details -->
      <div class="max-w-3xl mx-auto mt-10 text-center">
        <p
          class="text-xs uppercase tracking-[.3em]"
          style={`color:${accent}`}
        >
          {memory.date} · {memory.author}
        </p>

        <h1 class="serif text-4xl md:text-6xl mt-5 leading-tight">
          {memory.title}
        </h1>

        <p class="text-white/75 text-sm md:text-base leading-8 mt-7 whitespace-pre-wrap">
          {memory.body}
        </p>

        {#if memory.audio}
          <div class="mt-8 rounded-xl bg-white/10 p-5 text-left">
            <div class="flex items-center gap-2 mb-3">
              <Volume2 size={18} />
              <span class="text-sm">Voice Memory</span>
            </div>

            <audio
              controls
              src={memory.audio}
              class="w-full"
            ></audio>
          </div>
        {/if}
      </div>

      <!-- Memory navigation -->
      <div class="max-w-3xl mx-auto flex justify-between items-center gap-4 border-t border-white/15 mt-12 pt-6">
        <button
          type="button"
          class="flex items-center gap-2 text-sm text-white/70 hover:text-white disabled:opacity-25"
          disabled={activeIndex === 0}
          onclick={() => changeMemory(-1)}
        >
          <ChevronLeft size={19} />
          Previous
        </button>

        <div class="flex items-center gap-2 text-xs text-white/45">
          <Images size={15} />
          {activeIndex + 1} / {entries.length}
        </div>

        <button
          type="button"
          class="flex items-center gap-2 text-sm text-white/70 hover:text-white disabled:opacity-25"
          disabled={activeIndex === entries.length - 1}
          onclick={() => changeMemory(1)}
        >
          Next
          <ChevronRight size={19} />
        </button>
      </div>
    </div>
  </div>
{/if}
