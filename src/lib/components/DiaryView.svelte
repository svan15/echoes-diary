
<script>
import DiaryCalendar from '$lib/components/DiaryCalendar.svelte';
import DiaryPhotos from '$lib/components/DiaryPhotos.svelte';
import DiarySearch from '$lib/components/DiarySearch.svelte';
import DiaryMembers from '$lib/components/DiaryMembers.svelte';
import DiaryMilestones from '$lib/components/DiaryMilestones.svelte';
import MemoryViewer from '$lib/components/MemoryViewer.svelte';


import {
  ArrowLeft,
  Users,
  BookHeart,
  Plus,
  Heart,
  MessageCircle,
  Send,
  Trash2
} from 'lucide-svelte';

  let {
    diary,
    tab = $bindable('shared'),
    onBack = () => {},
    onCustomize = () => {},
    onWrite = () => {},
onEdit = () => {},
onDelete = () => {},
onAddMember = () => {},
onRemoveMember = () => {},
onToggleReaction = () => {},
onAddComment = () => {},
onDeleteComment = () => {},
onSaveMilestone = () => {},
onDeleteMilestone = () => {},
  } = $props();

  let entries = $derived(
    [...(diary?.entries ?? [])]
      .filter((e) => {
        if (tab === 'shared') {
          return e.type === 'shared';
        }

        if (tab === 'personal') {
          return e.type === 'personal' && e.author === 'You';
        }

        if (tab === 'theirs') {
          return (
            e.type === 'personal' &&
            e.author !== 'You' &&
            e.visibility === 'shared'
          );
        }

        return false;
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  );

  let commentDrafts = $state({});
let expandedComments = $state({});

function submitComment(entryId) {
  const text = (commentDrafts[entryId] ?? '').trim();
  if (!text) return;

  onAddComment(entryId, text);
  commentDrafts[entryId] = '';
  expandedComments[entryId] = true;
}

let viewerIndex = $state(null);

function openMemory(entryId) {
  const index = entries.findIndex((e) => e.id === entryId);
  if (index !== -1) viewerIndex = index;
}

function closeMemory() {
  viewerIndex = null;
}

function timelineDate(value) {
  if (!value) return { day: '--', month: '---' };

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return {
    day: String(day).padStart(2, '0'),
    month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  };
}

function milestoneNextDate(milestone) {
  if (!milestone?.date) return null;

  const [year, month, day] = milestone.date.split('-').map(Number);
  if (!year || !month || !day) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!milestone.recurring) {
    const date = new Date(year, month - 1, day);
    return date >= today ? date : null;
  }

  function occurrence(targetYear) {
    const date = new Date(targetYear, month - 1, day);

    // February 29 is observed on March 1 in non-leap years.
    if (month === 2 && day === 29 && date.getMonth() !== 1) {
      return new Date(targetYear, 2, 1);
    }

    return date;
  }

  let next = occurrence(Math.max(year, today.getFullYear()));

  if (next < today) {
    next = occurrence(next.getFullYear() + 1);
  }

  return next;
}

function milestoneDaysLeft(milestone) {
  const next = milestoneNextDate(milestone);
  if (!next) return null;

  const today = new Date();

  const start = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const end = Date.UTC(
    next.getFullYear(),
    next.getMonth(),
    next.getDate()
  );

  return Math.round((end - start) / 86400000);
}

let nextMilestone = $derived(
  [...(diary?.milestones ?? [])]
    .filter((m) => milestoneNextDate(m))
    .sort((a, b) => milestoneDaysLeft(a) - milestoneDaysLeft(b))[0] ?? null
);

</script>

<div class="max-w-5xl mx-auto">
  <button
    class="text-sm muted flex gap-2 items-center mb-6"
    onclick={onBack}
  >
    <ArrowLeft size={16} />
    Back to diaries
  </button>

  <!-- Diary header -->
  <div
    class="rounded-2xl overflow-hidden border border-[#514449] cover min-h-52 md:min-h-64 relative"
    style={`background-image:linear-gradient(90deg,#09090bdd,#09090b33),${
      diary.background
        ? `url('${diary.background}')`
        : diary.cover
          ? `url('${diary.cover}')`
          : `linear-gradient(120deg,${diary.accent}80,#222127)`
    }`}
  >
<div class="p-7 md:p-10 relative z-10">
  
      <p class="uppercase tracking-[.23em] text-[11px] mb-3">
        {diary.kind} diary
      </p>

      <h1 class="serif text-4xl md:text-5xl mb-3">
        {diary.name}
      </h1>

      <p class="text-sm text-[#eee1df] max-w-md">
        {diary.description}
      </p>

      <div class="flex items-center gap-2 mt-5 text-xs">
        <Users size={15} />
        {diary.members.join(' · ')}
      </div>
    

    </div>


{#if nextMilestone}
  {@const daysLeft = milestoneDaysLeft(nextMilestone)}

  <button
    type="button"
    class="w-full sm:w-auto md:absolute md:top-6 md:right-6 text-left rounded-xl border border-white/15 bg-black/40 backdrop-blur-md px-4 py-3 hover:bg-black/60 transition-colors"
    onclick={() => (tab = 'milestones')}
    aria-label={`View milestone ${nextMilestone.title}`}
  >
<div class="flex items-center gap-2 mb-2">
  <Heart size={12} color={diary.accent} />

  <span
    class="text-[10px] uppercase tracking-[.12em] text-white/60 truncate max-w-[170px]"
  >
    {nextMilestone.category || 'Milestone'}
  </span>
</div>

    <p class="serif text-base text-white truncate max-w-[170px]">
      {nextMilestone.title}
    </p>

    <div class="flex items-baseline gap-2 mt-1">
      <span
        class="serif text-2xl leading-none"
        style={`color:${diary.accent}`}
      >
        {daysLeft === 0 ? 'Today!' : daysLeft}
      </span>

      {#if daysLeft !== 0}
        <span class="text-[11px] text-white/60">
          {daysLeft === 1 ? 'day left' : 'days left'}
        </span>
      {/if}
    </div>
  </button>
{/if}



  </div>

  <!-- Journal navigation -->
{#if tab === 'calendar'}
  <div class="mt-8">
    <DiaryCalendar {diary} />
  </div>
{:else if tab === 'photos'}
  <DiaryPhotos {diary} />
{:else if tab === 'search'}
  <DiarySearch {diary} />
{:else if tab === 'members'}
  <DiaryMembers
    {diary}
    {onAddMember}
    {onRemoveMember}
  />
{:else if tab === 'milestones'}
  <DiaryMilestones
    {diary}
    {onSaveMilestone}
    {onDeleteMilestone}
  />
{:else}
   
<!-- New Entry action -->
<div class="flex justify-end mt-7 mb-7">
  {#if tab !== 'theirs'}
    <button
      class="btn primary flex gap-2 items-center"
      onclick={onWrite}
    >
      <Plus size={16} />
      New Entry
    </button>
  {/if}
</div>

  <!-- Section heading -->
  <div class="mb-5">
    <h2 class="serif text-3xl">
      {tab === 'shared'
        ? 'Our Shared Timeline'
        : tab === 'personal'
          ? 'My Journal'
          : 'Their Journals'}
    </h2>

    <p class="muted text-sm mt-2">
      {tab === 'shared'
        ? 'A collection of moments together.'
        : tab === 'personal'
          ? 'Your own thoughts inside this diary.'
          : 'Read the stories other members have chosen to share.'}
    </p>
  </div>

<!-- Entries with connected timeline -->
<div class="relative">
  {#if entries.length > 0}
    <!-- Continuous vertical line -->
    <div
      class="absolute top-6 bottom-6 left-[23px] sm:left-[29px] w-px pointer-events-none"
      style={`background:linear-gradient(to bottom, transparent, ${diary.accent}90 8%, ${diary.accent}90 92%, transparent)`}
    ></div>
  {/if}

  <div class="space-y-6">
    {#each entries as e (e.id)}
      <div class="relative flex items-start gap-3 sm:gap-5">
        <!-- Date marker -->
        <button
          type="button"
          class="relative z-10 w-12 h-12 sm:w-[60px] sm:h-[60px] shrink-0 rounded-full border-[3px] border-[#242025] shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-transform"
          style={`background:${diary.accent};color:#1b1618`}
          aria-label={`View memory from ${e.date}`}
          title={`View ${e.date}`}
          onclick={() => openMemory(e.id)}
        >
          <span class="text-[13px] sm:text-[16px] font-semibold leading-none">
            {timelineDate(e.date).day}
          </span>
          <span class="text-[8px] sm:text-[9px] font-semibold tracking-wider mt-1 leading-none">
            {timelineDate(e.date).month}
          </span>
        </button>

        <!-- Existing memory card -->
        <article
          class="panel p-4 sm:p-6 md:p-8 flex-1 min-w-0"
        >
        <div class="flex flex-wrap justify-between gap-2 text-xs muted">
          <span>{e.date} · {e.author}</span>

          <span class="flex items-center gap-1">
            {e.visibility === 'private'
              ? '🔒 Private'
              : e.type === 'shared'
                ? 'Shared memory'
                : 'Published journal'}
          </span>
        </div>

{#if e.author === 'You'}
  <div class="flex justify-end gap-3 mt-3">
    <button
      type="button"
      class="text-xs muted hover:text-white flex items-center gap-1"
      onclick={() => onEdit(e)}
    >
      Edit
    </button>

    <button
      type="button"
      class="text-xs text-red-300 hover:text-red-200 flex items-center gap-1"
      onclick={() => onDelete(e.id)}
    >
      Delete
    </button>
  </div>
{/if}

        <h3 class="serif text-2xl mt-3 mb-3">
          {e.title}
        </h3>

        <button
  type="button"
  class="text-xs flex items-center gap-2 mb-4 hover:underline"
  style={`color:${diary.accent}`}
  onclick={() => openMemory(e.id)}
>
  <span>View Memory</span>
  <span aria-hidden="true">↗</span>
</button>

        <p class="text-sm leading-7 whitespace-pre-wrap text-[#ded4d1]">
          {e.body}
        </p>
        
{#if e.photos?.length}
  <div
    class="grid gap-3 mt-5"
    class:grid-cols-2={e.photos.length > 1}
  >
    {#each e.photos as photo, index}
      <img
        src={photo}
        alt={`Photo ${index + 1} from ${e.title}`}
        class="w-full max-h-80 object-cover rounded-xl border border-[#40383c]"
      />
    {/each}
  </div>
{/if}

<!-- Reactions and comments -->
{#if e.type === 'shared' || e.visibility === 'shared'}
  <div class="mt-7 pt-5 border-t border-[#514449] space-y-4">
    <div class="flex flex-wrap items-center gap-5">
      <button
        type="button"
        class="flex items-center gap-2 text-sm transition-colors hover:text-[#e7a6a6]"
        class:text-[#e7a6a6]={e.likedByYou}
        onclick={() => onToggleReaction(e.id)}
        aria-label={e.likedByYou ? 'Remove heart' : 'Heart this memory'}
      >
        <Heart
          size={19}
          fill={e.likedByYou ? 'currentColor' : 'none'}
        />
        <span>{e.likedByYou ? 'Loved' : 'Love'}</span>
        <span class="muted text-xs">{e.likedByYou ? 1 : 0}</span>
      </button>

      <button
        type="button"
        class="flex items-center gap-2 text-sm hover:text-white"
        onclick={() => expandedComments[e.id] = !expandedComments[e.id]}
      >
        <MessageCircle size={19} />
        <span>Comments</span>
        <span class="muted text-xs">{e.comments?.length ?? 0}</span>
      </button>
    </div>

    {#if expandedComments[e.id]}
      <div class="space-y-4">
        {#each e.comments ?? [] as comment (comment.id)}
          <div class="rounded-xl bg-[#292529] p-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-medium">{comment.author}</span>
                <span class="text-xs muted">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>

              {#if comment.author === 'You'}
                <button
                  type="button"
                  class="text-red-300 hover:text-red-200"
                  aria-label="Delete comment"
                  onclick={() => onDeleteComment(e.id, comment.id)}
                >
                  <Trash2 size={15} />
                </button>
              {/if}
            </div>

            <p class="text-sm leading-6 mt-2 whitespace-pre-wrap">
              {comment.text}
            </p>
          </div>
        {/each}

        <form
          class="flex gap-2"
          onsubmit={(event) => {
            event.preventDefault();
            submitComment(e.id);
          }}
        >
          <input
            class="field flex-1 min-w-0"
            placeholder="Leave a thought..."
            maxlength="500"
            value={commentDrafts[e.id] ?? ''}
            oninput={(event) => commentDrafts[e.id] = event.currentTarget.value}
          />

          <button
            type="submit"
            class="btn primary"
            disabled={!(commentDrafts[e.id] ?? '').trim()}
            aria-label="Post comment"
          >
            <Send size={17} />
          </button>
        </form>
      </div>
    {/if}
  </div>
{/if}

        </article>
      </div>
    {:else}
      <div class="panel p-12 text-center">
        <BookHeart
          size={30}
          class="mx-auto mb-3"
          color={diary.accent}
        />

        <h3 class="serif text-2xl">
          {tab === 'theirs'
            ? 'No shared journals yet.'
            : 'The first page is waiting.'}
        </h3>

        <p class="muted text-sm mt-2 mb-5">
          {tab === 'theirs'
            ? 'When another member shares a journal entry, it will appear here.'
            : "Write something you'll want to remember."}
        </p>

        {#if tab !== 'theirs'}
          <button class="btn primary" onclick={onWrite}>
            Write an entry
          </button>
        {/if}
      </div>
    {/each}
  </div>
</div>
{/if}

{#if viewerIndex !== null}
  <MemoryViewer
    {entries}
    initialIndex={viewerIndex}
    accent={diary.accent}
    onClose={closeMemory}
  />
{/if}
</div>
