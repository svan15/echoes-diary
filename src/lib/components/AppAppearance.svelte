
<script>
  import { Palette, Check, RotateCcw, Save } from 'lucide-svelte';

  let {
    accent = '#dca9a6',
    onSave = () => {}
  } = $props();

  const defaultAccent = '#dca9a6';

  const themes = [
    { name: 'Dusty Rose', color: '#dca9a6' },
    { name: 'Champagne', color: '#d9b781' },
    { name: 'Sage', color: '#9fc9b5' },
    { name: 'Moonlight', color: '#92b9d3' },
    { name: 'Lavender', color: '#b4a4da' },
    { name: 'Mauve', color: '#d2a0ca' },
    { name: 'Ivory', color: '#e8ddd0' },
    { name: 'Silver', color: '#a3a7a9' }
  ];

  let selectedColor = $state(accent);
  let saved = $state(false);

  $effect(() => {
    selectedColor = accent;
  });

  function save() {
    onSave(selectedColor);
    saved = true;
  }

  function reset() {
    selectedColor = defaultAccent;
    saved = false;
  }
</script>

<div class="max-w-4xl mx-auto space-y-8">
  <div class="space-y-2">
    <p class="text-xs uppercase tracking-[.25em] muted">
      Your Echoes experience
    </p>
    <h1 class="serif text-4xl">Appearance</h1>
    <p class="muted text-sm">
      Choose the colors that make your space feel like yours.
    </p>
  </div>

  <div class="panel p-6 md:p-9 space-y-7">
    <div class="flex items-center gap-3">
      <Palette size={21} />
      <div>
        <h2 class="serif text-2xl">Accent Color</h2>
        <p class="muted text-sm mt-1">
          Customize the main dashboard without changing your diaries.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-4 sm:grid-cols-8 gap-4">
      {#each themes as theme}
        <button
          type="button"
          class="flex flex-col items-center gap-2"
          onclick={() => {
            selectedColor = theme.color;
            saved = false;
          }}
          aria-label={`Choose ${theme.name}`}
          aria-pressed={selectedColor === theme.color}
        >
          <span
            class="w-12 h-12 rounded-full flex items-center justify-center border-2"
            class:border-white={selectedColor === theme.color}
            class:border-transparent={selectedColor !== theme.color}
            style={`background:${theme.color}`}
          >
            {#if selectedColor === theme.color}
              <Check size={19} color="#1a1719" />
            {/if}
          </span>

          <span class="text-[10px] muted text-center">
            {theme.name}
          </span>
        </button>
      {/each}
    </div>

    <div class="border-t border-[#343337] pt-6 space-y-4">
      <h3 class="serif text-xl">Live Preview</h3>

      <div class="rounded-2xl bg-[#111113] border border-[#343337] p-5">
        <div class="flex justify-between items-center gap-3 mb-5">
          <span class="serif tracking-[.2em] text-xl">ECHOES</span>
          <span class="text-xs muted">A Library of Us</span>
        </div>

        <div class="rounded-xl bg-[#292529] p-5 space-y-4">
          <div>
            <p class="text-xs" style={`color:${selectedColor}`}>
              YOUR COLLECTION
            </p>
            <h4 class="serif text-2xl mt-2">
              A place for every story
            </h4>
            <p class="muted text-sm mt-2">
              Keep the memories that matter most.
            </p>
          </div>

          <div class="flex gap-3 items-center flex-wrap">
            <span
              class="px-4 py-2 rounded-lg text-sm font-semibold"
              style={`background:${selectedColor};color:#191416`}
            >
              + Create Diary
            </span>
            <span
              class="px-4 py-2 rounded-lg text-sm border"
              style={`border-color:${selectedColor};color:${selectedColor}`}
            >
              My Diaries
            </span>
          </div>
        </div>
      </div>
    </div>

    {#if saved}
      <p class="text-sm text-[#9fc9b5]">
        Appearance saved successfully.
      </p>
    {/if}

    <div class="flex flex-wrap gap-3">
      <button class="btn primary flex items-center gap-2" type="button" onclick={save}>
        <Save size={17} />
        Save Appearance
      </button>

      <button class="btn flex items-center gap-2" type="button" onclick={reset}>
        <RotateCcw size={17} />
        Reset Selection
      </button>
    </div>
  </div>
</div>
