
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
  Trash2,
  MoreHorizontal
} from 'lucide-svelte';

  let {
    diary, 
    memberPreview = '',
    members = [],
    currentUserId = null,
    tab = $bindable('shared'),
    onBack = () => {},
onShareDiary = () => {},
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

  function getCommentAuthor(comment) {
  return members.find(
    (member) => member.user_id === comment.authorId
  );
}

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
let selectedMemberProfile = $state(null);

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
  <div class="flex items-center justify-between gap-3 mb-6 pt-12 md:pt-0">
    <button
      class="text-sm muted flex gap-2 items-center"
    onclick={onBack}
  >
    <ArrowLeft size={16} />
    Back to diaries
  </button>

  {#if diary.privacy === 'shared' && diary.ownerId === currentUserId}
    <button
      type="button"
      onclick={onShareDiary}
      class="shrink-0 px-3 py-2 md:px-5 md:py-2.5 rounded-xl bg-[#dca9a6]/15 border border-[#dca9a6]/30 text-[#dca9a6] text-xs md:text-sm font-medium hover:bg-[#dca9a6]/25 transition-all"
    >
      + Share Diary
    </button>
  {/if}
  </div>
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

<h1
  class="serif text-4xl md:text-5xl mb-3 line-clamp-2 break-words md:max-w-[calc(100%-260px)]"
>
  {diary.name}
</h1>

      <p class="text-sm text-[#eee1df] max-w-md">
        {diary.description}
      </p>

<button
  type="button"
  onclick={() => (tab = 'members')}
  class="flex items-center gap-2 mt-5 text-xs text-white/90 hover:text-[#e7a6a6] transition-colors cursor-pointer"
>
  <Users size={15} />
  <div class="flex items-center -space-x-2">
  {#each members.slice(0, 3) as member (member.user_id)}
    <div
      class="w-7 h-7 rounded-full border-2 border-[#241a22] bg-[#49333f] overflow-hidden flex items-center justify-center text-[10px] font-semibold text-white"
      title={member.display_name || member.username || 'Unknown'}
    >
      {#if member.avatar_url}
        <img
          src={member.avatar_url}
          alt={member.display_name || member.username || 'Member'}
          class="w-full h-full object-cover"
        />
      {:else}
        {(member.display_name || member.username || '?').charAt(0).toUpperCase()}
      {/if}
    </div>
  {/each}
</div>
  <span>{memberPreview || 'Loading members...'}</span>
  <span class="opacity-60">→</span>
</button>
    

    </div>


{#if nextMilestone}
  {@const daysLeft = milestoneDaysLeft(nextMilestone)}

  <button
    type="button"
    class="absolute top-3 right-3 md:top-6 md:right-6 z-10 w-auto max-w-[70%] text-left rounded-xl border border-white/15 bg-black/40 backdrop-blur-md px-3 py-2 md:px-4 md:py-3 hover:bg-black/60 transition-colors"
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
  {members}
    {diary}
    {onAddMember}
    {onRemoveMember}
    onViewProfile={(member) => (selectedMemberProfile = member)}
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
        <div class="flex items-center gap-3 text-xs muted">
        {#each members.filter((member) => member.user_id === e.author) as author}
  <div
    class="w-6 h-6 rounded-full overflow-hidden bg-[#49333f] flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
  >
    {#if author.avatar_url}
      <img
        src={author.avatar_url}
        alt={author.display_name || author.username || 'Author'}
        class="w-full h-full object-cover"
      />
    {:else}
      {(author.display_name || author.username || '?').charAt(0).toUpperCase()}
    {/if}
  </div>
{/each}
        
<div class="flex flex-col gap-0.5">
  <span class="text-sm font-semibold text-white">
    {members.find((member) => member.user_id === e.author)?.display_name || members.find((member) => member.user_id === e.author)?.username || e.author}
  </span>
  <span class="text-xs text-zinc-400">
    {e.date}
  </span>
</div>

<div class="ml-auto shrink-0">
  {#if e.author === currentUserId}
    <details class="relative">
      <summary
        class="list-none cursor-pointer rounded-lg px-2 py-1 text-zinc-400 hover:bg-white/10 hover:text-white"
        aria-label="Memory options"
      >
        <span class="text-xl leading-none">⋯</span>
      </summary>

      <div class="absolute right-0 top-full z-30 mt-1 w-40 rounded-xl border border-white/10 bg-[#292329] p-1.5 shadow-xl">
        <button
          type="button"
          class="w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-white/10"
          onclick={() => onEdit(e)}
        >
          Edit memory
        </button>
        <button
          type="button"
          class="w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-white/10"
          onclick={() => onDelete(e.id)}
        >
          Delete memory
        </button>
      </div>
    </details>
  {/if}
</div>
        </div>


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
        <span class="muted text-xs">{e.likeCount ?? 0}</span>
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
        {@const authorProfile = getCommentAuthor(comment)}
          <div class="rounded-xl bg-[#292529] p-4">
            <div class="flex items-center justify-between gap-3">
<div class="flex flex-wrap items-center gap-2">


  <div class="w-8 h-8 rounded-full overflow-hidden bg-[#51434d] flex items-center justify-center shrink-0">
    {#if authorProfile?.avatar_url}
      <img
        src={authorProfile.avatar_url}
        alt={authorProfile.display_name || authorProfile.username || 'Member'}
        class="w-full h-full object-cover"
      />
    {:else}
      <span class="text-xs font-semibold text-white">
        {(authorProfile?.display_name || authorProfile?.username || comment.author || '?').charAt(0).toUpperCase()}
      </span>
    {/if}
  </div>

  <span class="text-sm font-medium">
    {authorProfile?.display_name || authorProfile?.username || comment.author}
  </span>
                <span class="text-xs muted">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>

{#if comment.author === 'You'}
  <div class="relative group/commentmenu">
    <button
      type="button"
      class="text-[#cfc2c6] hover:text-white p-1 rounded-md"
      aria-label="Comment options"
    >
      <MoreHorizontal size={18} />
    </button>

    <div
      class="absolute right-0 top-full z-30 hidden group-focus-within/commentmenu:block w-44 rounded-lg border border-white/15 bg-[#242027] shadow-xl p-1"
    >
      <button
        type="button"
        class="w-full whitespace-nowrap text-left text-xs text-red-300 hover:bg-white/10 rounded-md px-3 py-2 flex items-center gap-2"
        onclick={() => onDeleteComment(e.id, comment.id)}
      >
        <Trash2 size={13} />
        Delete comment
      </button>
    </div>
  </div>
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

{#if selectedMemberProfile}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
    <div class="w-full max-w-sm rounded-2xl border border-white/10 bg-[#241c24] p-6 text-center shadow-2xl">

      <button
        type="button"
        class="mb-4 block ml-auto text-zinc-400 hover:text-white"
        onclick={() => (selectedMemberProfile = null)}
        aria-label="Close profile"
      >
        ✕
      </button>

      <div class="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#49333f] text-3xl font-semibold text-white">
        {#if selectedMemberProfile.avatar_url}
          <img
            src={selectedMemberProfile.avatar_url}
            alt="Profile picture"
            class="h-full w-full object-cover"
          />
        {:else}
          {(selectedMemberProfile.display_name || selectedMemberProfile.username || '?').charAt(0).toUpperCase()}
        {/if}
      </div>

      <h2 class="serif text-2xl text-white">
        {selectedMemberProfile.display_name || selectedMemberProfile.username}
      </h2>

      <p class="mt-1 text-sm text-zinc-400">
        @{selectedMemberProfile.username}
      </p>

      <div class="mt-6 border-t border-white/10 pt-5">
        <p class="mb-2 text-xs uppercase tracking-widest text-zinc-500">About</p>
        <p class="whitespace-pre-wrap text-sm text-zinc-300">
          {selectedMemberProfile.bio || 'No bio added yet.'}
        </p>
      </div>

    </div>
  </div>
{/if}