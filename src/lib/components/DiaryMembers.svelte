
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


</div>


