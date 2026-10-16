
<script>
  import {
    Users,
    Crown,
    UserRoundPlus,
    Trash2,
    X,
    ShieldCheck,
    Mail
  } from 'lucide-svelte';

  let {
    diary,
    members = [],
    onViewProfile = () => {},
    onAddMember = () => {},
    onRemoveMember = () => {}
  } = $props();

  let showAdd = $state(false);
  let memberName = $state('');
  let error = $state('');


  function addMember() {
    const name = memberName.trim();

    if (!name) {
      error = 'Please enter a name.';
      return;
    }

    if (members.some(m => m.toLowerCase() === name.toLowerCase())) {
      error = 'This member is already listed.';
      return;
    }

    onAddMember(name);
    memberName = '';
    error = '';
    showAdd = false;
  }

  function removeMember(name) {
    if (name === 'You') return;

    if (confirm(`Remove ${name} from this diary's local member list?`)) {
      onRemoveMember(name);
    }
  }
</script>

<div class="max-w-5xl mx-auto space-y-7 mt-8">
  <div class="flex flex-wrap justify-between items-center gap-4">
    <div>
      <p class="uppercase tracking-[.22em] text-xs muted mb-2">
        The people in our story
      </p>
      <h2 class="serif text-4xl">Diary Members</h2>
      <p class="muted text-sm mt-2">
        A space for everyone who belongs to this diary.
      </p>
    </div>

    <button
      class="btn primary flex items-center gap-2"
      onclick={() => showAdd = true}
    >
      <UserRoundPlus size={17} />
      Add Member
    </button>
  </div>

  <div class="panel p-5 md:p-7">
    <div class="flex justify-between items-center mb-6">
      <h3 class="serif text-2xl">People</h3>
      <span class="text-xs muted">
        {members.length} {members.length === 1 ? 'member' : 'members'}
      </span>
    </div>

    <div class="space-y-3">
{#each members as member (member.user_id)}
        <div class="flex items-center justify-between gap-3 rounded-xl border border-[#40383c] p-4">
          <button
  type="button"
  class="flex items-center gap-3 min-w-0 text-left cursor-pointer rounded-lg hover:opacity-80 transition-opacity"
  onclick={() => onViewProfile(member)}
  aria-label={`View ${member.display_name || member.username || 'member'}'s profile`}
>
            <div
              class="w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0"
              style={`background:${diary.accent}30; color:${diary.accent}`}
            >
{#if member.avatar_url}
  <img
    src={member.avatar_url}
    alt={`${member.username}'s profile picture`}
    class="w-full h-full rounded-full object-cover"
  />
{:else}
  {(member.display_name || member.username || '?').charAt(0).toUpperCase()}
{/if}

            </div>

            <div class="min-w-0">
<p class="font-medium truncate">{member.display_name || member.username || 'Unknown'}</p>
              <p class="text-xs muted mt-1 flex items-center gap-1">
{#if member.user_id === diary.ownerId}
  <Crown size={13} />
  Owner
{:else}
  <Users size={13} />
  Member
{/if}
              </p>
            </div>
          </button>

          {#if member !== 'You'}
            <button
              type="button"
              class="btn text-red-300"
              aria-label={`Remove ${member}`}
              onclick={() => removeMember(member)}
            >
              <Trash2 size={16} />
            </button>
          {:else}
            <ShieldCheck size={19} class="text-[#c99d98]" />
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <div class="panel p-6 md:p-7 space-y-3">
    <div class="flex items-center gap-2">
      <Mail size={19} />
      <h3 class="serif text-2xl">Invitations</h3>
    </div>

    <p class="muted text-sm leading-7">
      Email invitations and pending invitation tracking will become
      available after Supabase Authentication is connected.
      For now, adding a name only changes this browser's local member list.
    </p>
  </div>
</div>

{#if showAdd}
  <div class="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
    <div class="panel w-full max-w-md p-6 md:p-8 space-y-5">
      <div class="flex justify-between items-center">
        <h3 class="serif text-2xl">Add a Member</h3>

        <button
          class="btn"
          aria-label="Close"
          onclick={() => {
            showAdd = false;
            error = '';
          }}
        >
          <X size={18} />
        </button>
      </div>

      <p class="muted text-sm">
        Add a name to this diary's local member list.
        This does not invite a real account yet.
      </p>

      <form
        class="space-y-4"
        onsubmit={(event) => {
          event.preventDefault();
          addMember();
        }}
      >
        <div class="space-y-2">
          <label for="member-name" class="text-sm">Member name</label>
          <input
            id="member-name"
            class="field w-full"
            placeholder="Enter a name"
            maxlength="60"
            bind:value={memberName}
          />
        </div>

        {#if error}
          <p class="text-red-300 text-xs">{error}</p>
        {/if}

        <button type="submit" class="btn primary w-full">
          Add to Local List
        </button>
      </form>
    </div>
  </div>
{/if}
