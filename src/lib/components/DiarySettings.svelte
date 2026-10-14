
<script>
  import { X, Trash2 } from 'lucide-svelte';

  let {
    draft = $bindable(),
    editing = null,
    error = '',
    colors = [],
    onClose = () => {},
    onSave = () => {},
    onDelete = () => {},
    onImageUpload = () => {}
  } = $props();
</script>

<div
  class="overlay"
  role="presentation"
  onclick={(e) => {
    if (e.target === e.currentTarget) onClose();
  }}
>
  <div class="modal">
    <div class="flex justify-between items-center mb-6">
      <h2 class="serif text-3xl">
        {editing ? 'Customize Diary' : 'Create a Diary'}
      </h2>

      <button aria-label="Close" onclick={onClose}>
        <X size={22} />
      </button>
    </div>

    <div class="space-y-4">
      <div>
        <label for="diary-name">Diary name</label>
        <input
          id="diary-name"
          class="field"
          maxlength="60"
          placeholder="Our Little Universe"
          bind:value={draft.name}
        />
      </div>

      <div>
        <label for="diary-kind">Diary type</label>
        <select id="diary-kind" class="field" bind:value={draft.kind}>
          <option>Couple</option>
          <option>Best Friends</option>
          <option>Family</option>
          <option>Personal</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label for="diary-description">Description</label>
        <textarea
          id="diary-description"
          class="field"
          rows="2"
          maxlength="240"
          bind:value={draft.description}
        ></textarea>
      </div>

      <div>
        <label>Theme color</label>
        <div class="flex flex-wrap gap-3 items-center">
          {#each colors as c}
            <button
              aria-label={`Select ${c}`}
              class="w-8 h-8 rounded-full border-2"
              style={`background:${c};border-color:${draft.accent === c ? 'white' : 'transparent'}`}
              onclick={() => (draft.accent = c)}
            ></button>
          {/each}

          <input
            aria-label="Custom theme color"
            type="color"
            bind:value={draft.accent}
            class="w-9 h-9 bg-transparent cursor-pointer"
          />
        </div>
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label for="diary-cover">Diary cover image</label>
          <input
            id="diary-cover"
            type="file"
            accept="image/*"
            class="field text-xs"
            onchange={(e) => onImageUpload(e, 'cover')}
          />

          {#if draft.cover}
            <button
              class="text-xs muted mt-2 underline"
              onclick={() => (draft.cover = '')}
            >
              Remove cover
            </button>
          {/if}
        </div>

        <div>
          <label for="diary-background">Diary background image</label>
          <input
            id="diary-background"
            type="file"
            accept="image/*"
            class="field text-xs"
            onchange={(e) => onImageUpload(e, 'background')}
          />

          {#if draft.background}
            <button
              class="text-xs muted mt-2 underline"
              onclick={() => (draft.background = '')}
            >
              Remove background
            </button>
          {/if}
        </div>
      </div>

      {#if error}
        <p class="text-sm text-red-300">{error}</p>
      {/if}

      <p class="text-xs muted">
        In this demo, customizations are saved only in your browser.
        Live sharing comes with the backend phase.
      </p>

      <div class="flex justify-between items-center pt-3">
        <div>
          {#if editing}
            <button
              class="text-red-300 text-xs flex items-center gap-1"
              onclick={onDelete}
            >
              <Trash2 size={14} />
              Delete diary
            </button>
          {/if}
        </div>

        <button
          class="btn primary"
          disabled={!draft.name.trim()}
          onclick={onSave}
        >
          {editing ? 'Save Changes' : 'Create Diary'}
        </button>
      </div>
    </div>
  </div>
</div>
