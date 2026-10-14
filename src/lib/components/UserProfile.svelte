
<script>
  import {
    UserRound,
    Camera,
    Save,
    ShieldCheck,
    X,
    Palette
  } from 'lucide-svelte';

  let {
    profile,
    onSave = () => {}
  } = $props();

  let draft = $state({
    displayName: '',
    username: '',
    bio: '',
    avatar: '',
    theme: 'rose'
  });

  let error = $state('');
  let savingImage = $state(false);
  let saved = $state(false);

  $effect(() => {
    draft = {
      displayName: profile?.displayName ?? '',
      username: profile?.username ?? '',
      bio: profile?.bio ?? '',
      avatar: profile?.avatar ?? '',
      theme: profile?.theme ?? 'rose'
    };
  });

  const themes = [
    { id: 'rose', name: 'Rose', color: '#dca9a6' },
    { id: 'gold', name: 'Champagne', color: '#d9b781' },
    { id: 'sage', name: 'Sage', color: '#9fc9b5' },
    { id: 'blue', name: 'Moonlight', color: '#92b9d3' },
    { id: 'violet', name: 'Lavender', color: '#b4a4da' }
  ];

  async function uploadAvatar(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    error = '';

    if (!file.type.startsWith('image/')) {
      error = 'Please choose an image.';
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      error = 'Please choose an image under 15 MB.';
      return;
    }

    savingImage = true;

    try {
      const image = await createImageBitmap(file);

      try {
        const canvas = document.createElement('canvas');
        const scale = Math.min(
          1,
          320 / Math.max(image.width, image.height)
        );

        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        draft.avatar = canvas.toDataURL('image/webp', 0.7);
        saved = false;
      } finally {
        image.close();
      }
    } catch {
      error = 'Could not process this image.';
    } finally {
      savingImage = false;
      event.currentTarget.value = '';
    }
  }

  function saveProfile() {
    error = '';

    const name = draft.displayName.trim();
    const username = draft.username.trim().replace(/^@/, '');

    if (!name) {
      error = 'Please enter a display name.';
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
      error = 'Username must be 3–24 letters, numbers, or underscores.';
      return;
    }

    onSave({
      ...draft,
      displayName: name,
      username: username.toLowerCase(),
      bio: draft.bio.trim()
    });

    saved = true;
  }
</script>

<div class="max-w-4xl mx-auto space-y-8">
  <div>
    <p class="uppercase tracking-[.22em] text-xs muted mb-2">
      Your space in Echoes
    </p>
    <h1 class="serif text-4xl">My Profile</h1>
    <p class="muted text-sm mt-2">
      A little about the person behind the memories.
    </p>
  </div>

  <div class="panel overflow-hidden">
    <div
      class="h-32 md:h-40"
      style={`background:linear-gradient(120deg, ${themes.find(t => t.id === draft.theme)?.color ?? '#dca9a6'}55, #29252b, #161619)`}
    ></div>

    <div class="px-6 md:px-9 pb-8">
      <div class="relative -mt-12 mb-5 w-fit">
        <div class="w-24 h-24 rounded-full border-4 border-[#1a1b1e] overflow-hidden bg-[#343037] flex items-center justify-center">
          {#if draft.avatar}
            <img
              src={draft.avatar}
              alt="Your profile"
              class="w-full h-full object-cover"
            />
          {:else}
            <UserRound size={38} class="text-[#c7babb]" />
          {/if}
        </div>

        <label
          for="profile-avatar"
          class="absolute -bottom-1 -right-1 rounded-full bg-[#dca9a6] text-[#171417] p-2 cursor-pointer"
          title="Change profile photo"
        >
          <Camera size={16} />
        </label>

        <input
          id="profile-avatar"
          type="file"
          accept="image/*"
          class="hidden"
          onchange={uploadAvatar}
        />
      </div>

      <h2 class="serif text-2xl">
        {draft.displayName || 'Your Name'}
      </h2>
      <p class="muted text-sm mt-1">
        @{draft.username || 'username'}
      </p>

      {#if draft.avatar}
        <button
          type="button"
          class="text-xs text-red-300 mt-3 flex items-center gap-1"
          onclick={() => {
            draft.avatar = '';
            saved = false;
          }}
        >
          <X size={13} />
          Remove profile photo
        </button>
      {/if}
    </div>
  </div>

  <form class="panel p-6 md:p-9 space-y-6" onsubmit={(e) => {
    e.preventDefault();
    saveProfile();
  }}>
    <div>
      <h3 class="serif text-2xl">Personal Information</h3>
      <p class="muted text-sm mt-2">
        These details will become part of your account when we add authentication.
      </p>
    </div>

    <div class="grid md:grid-cols-2 gap-5">
      <div>
        <label for="profile-name">Display name</label>
        <input
          id="profile-name"
          class="field"
          maxlength="60"
          required
          bind:value={draft.displayName}
          oninput={() => saved = false}
          placeholder="Your name"
        />
      </div>

      <div>
        <label for="profile-username">Username</label>
        <input
          id="profile-username"
          class="field"
          maxlength="24"
          required
          bind:value={draft.username}
          oninput={() => saved = false}
          placeholder="your_username"
        />
      </div>
    </div>

    <div>
      <label for="profile-bio">Bio</label>
      <textarea
        id="profile-bio"
        class="field min-h-28"
        maxlength="300"
        bind:value={draft.bio}
        oninput={() => saved = false}
        placeholder="A few words about yourself..."
      ></textarea>
      <p class="text-xs muted mt-2">
        {draft.bio.length}/300 characters
      </p>
    </div>

    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <Palette size={17} />
        <h3 class="serif text-xl">Your Accent Color</h3>
      </div>

      <div class="flex flex-wrap gap-3">
        {#each themes as theme}
          <button
            type="button"
            class="w-10 h-10 rounded-full border-2 transition-transform hover:scale-110"
            class:border-white={draft.theme === theme.id}
            class:border-transparent={draft.theme !== theme.id}
            style={`background:${theme.color}`}
            aria-label={theme.name}
            title={theme.name}
            onclick={() => {
              draft.theme = theme.id;
              saved = false;
            }}
          ></button>
        {/each}
      </div>
    </div>

    {#if error}
      <p class="text-sm text-red-300">{error}</p>
    {/if}

    {#if saved}
      <p class="text-sm text-[#9fc9b5]">Profile saved locally.</p>
    {/if}

    <button
      type="submit"
      class="btn primary flex items-center gap-2"
      disabled={savingImage}
    >
      <Save size={17} />
      Save Profile
    </button>
  </form>

  <div class="panel p-6 md:p-8">
    <div class="flex items-center gap-3 mb-3">
      <ShieldCheck size={20} />
      <h3 class="serif text-xl">Account & Privacy</h3>
    </div>
    <p class="muted text-sm leading-7">
      Your profile is currently stored in this browser only.
      Email, password, account security, and cross-device syncing
      will become available when Supabase Authentication is connected.
    </p>
  </div>
</div>
