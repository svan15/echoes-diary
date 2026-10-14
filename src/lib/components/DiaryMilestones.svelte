
<script>
  import { Heart, Plus, Pencil, Trash2, X, CalendarHeart } from 'lucide-svelte';

  let {
    diary,
    onSaveMilestone = () => {},
    onDeleteMilestone = () => {}
  } = $props();

  let editingId = $state(null);
  let showForm = $state(false);
  let title = $state('');
  let date = $state('');
  let recurring = $state(true);
  let category = $state('Anniversary');

  const categories = [
    'Anniversary', 'Birthday', 'First Date',
    'Special Memory', 'Other'
  ];

  function parseDate(value) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function nextOccurrence(milestone) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const original = parseDate(milestone.date);

    if (!milestone.recurring) return original;

    let next = new Date(
      today.getFullYear(),
      original.getMonth(),
      original.getDate()
    );

    // February 29 anniversaries are observed on March 1 in non-leap years.
    if (next.getMonth() !== original.getMonth()) {
      next = new Date(today.getFullYear(), 2, 1);
    }

    if (next < today) {
      next = new Date(
        today.getFullYear() + 1,
        original.getMonth(),
        original.getDate()
      );
    }

    return next;
  }

  function daysUntil(milestone) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next = nextOccurrence(milestone);

    const utcToday = Date.UTC(
      today.getFullYear(), today.getMonth(), today.getDate()
    );
    const utcNext = Date.UTC(
      next.getFullYear(), next.getMonth(), next.getDate()
    );

    return Math.round((utcNext - utcToday) / 86400000);
  }

  let milestones = $derived(
    [...(diary?.milestones ?? [])].sort(
      (a, b) => daysUntil(a) - daysUntil(b)
    )
  );

  function openNew() {
    editingId = null;
    title = '';
    date = '';
    recurring = true;
    category = 'Anniversary';
    showForm = true;
  }

  function openEdit(milestone) {
    editingId = milestone.id;
    title = milestone.title;
    date = milestone.date;
    recurring = milestone.recurring;
    category = milestone.category;
    showForm = true;
  }

  function save() {
    if (!title.trim() || !date) return;

    onSaveMilestone({
      id: editingId,
      title: title.trim(),
      date,
      recurring,
      category
    });

    showForm = false;
  }

  function remove(milestone) {
    if (confirm(`Delete "${milestone.title}"?`)) {
      onDeleteMilestone(milestone.id);
    }
  }
</script>

<div class="max-w-5xl mx-auto mt-8 space-y-8">
  <div class="flex flex-wrap justify-between items-center gap-4">
    <div>
      <p class="uppercase tracking-[.22em] text-xs muted mb-2">
        Dates worth remembering
      </p>
      <h2 class="serif text-4xl">Our Milestones</h2>
      <p class="muted text-sm mt-2">
        Some days stay with us forever.
      </p>
    </div>

    <button class="btn primary flex items-center gap-2" onclick={openNew}>
      <Plus size={17} />
      Add Milestone
    </button>
  </div>

  {#if milestones.length}
    <div class="grid md:grid-cols-2 gap-5">
      {#each milestones as milestone (milestone.id)}
        <article class="panel p-6 md:p-8 space-y-5">
          <div class="flex justify-between items-start gap-3">
            <div class="flex items-center gap-2 text-xs muted">
              <Heart size={15} color={diary.accent} />
              {milestone.category}
            </div>

            <div class="flex gap-3">
              <button
                aria-label="Edit milestone"
                onclick={() => openEdit(milestone)}
              >
                <Pencil size={16} />
              </button>
              <button
                aria-label="Delete milestone"
                class="text-red-300"
                onclick={() => remove(milestone)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div>
            <h3 class="serif text-3xl">{milestone.title}</h3>
            <p class="muted text-sm mt-2">
              {parseDate(milestone.date).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })}
              {milestone.recurring ? ' · Every year' : ' · One-time'}
            </p>
          </div>

          <div class="border-t border-[#514449] pt-5">
            {#if daysUntil(milestone) === 0}
              <p class="serif text-2xl" style={`color:${diary.accent}`}>
                Today is the day!
              </p>
            {:else if daysUntil(milestone) < 0}
              <p class="muted text-sm">This milestone has passed.</p>
            {:else}
              <div class="flex items-end gap-3">
                <span class="serif text-5xl" style={`color:${diary.accent}`}>
                  {daysUntil(milestone)}
                </span>
                <span class="muted text-sm pb-2">
                  {daysUntil(milestone) === 1 ? 'day' : 'days'} to go
                </span>
              </div>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <div class="panel p-12 text-center">
      <CalendarHeart size={32} class="mx-auto mb-4" />
      <h3 class="serif text-2xl">Your story is just beginning</h3>
      <p class="muted text-sm mt-3">
        Add an important date to start collecting milestones.
      </p>
    </div>
  {/if}
</div>

{#if showForm}
  <div class="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4">
    <div class="panel w-full max-w-md p-6 md:p-8 space-y-5">
      <div class="flex justify-between items-center">
        <h3 class="serif text-2xl">
          {editingId ? 'Edit Milestone' : 'New Milestone'}
        </h3>
        <button class="btn" aria-label="Close" onclick={() => showForm = false}>
          <X size={18} />
        </button>
      </div>

      <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); save(); }}>
        <div class="space-y-2">
          <label for="milestone-title" class="text-sm">Milestone name</label>
          <input
            id="milestone-title"
            class="field w-full"
            placeholder="Our Anniversary"
            maxlength="100"
            required
            bind:value={title}
          />
        </div>

        <div class="space-y-2">
          <label for="milestone-date" class="text-sm">Date</label>
          <input
            id="milestone-date"
            type="date"
            class="field w-full"
            required
            bind:value={date}
          />
        </div>

        <div class="space-y-2">
          <label for="milestone-category" class="text-sm">Category</label>
          <select id="milestone-category" class="field w-full" bind:value={category}>
            {#each categories as item}
              <option value={item}>{item}</option>
            {/each}
          </select>
        </div>

        <label class="flex items-center gap-3 text-sm">
          <input type="checkbox" bind:checked={recurring} />
          Repeat every year
        </label>

        <button class="btn primary w-full" type="submit">
          {editingId ? 'Save Changes' : 'Create Milestone'}
        </button>
      </form>
    </div>
  </div>
{/if}
