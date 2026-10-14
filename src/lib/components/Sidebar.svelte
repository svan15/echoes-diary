<script>
  import {
    Home,
    ArrowLeft,
    Users,
    BookOpen,
    BookHeart,
    Settings,
    Library,
    CalendarDays,
    Images,
    Search,
    CalendarHeart,
UserRound,
Palette,
  } from "lucide-svelte";

  let {
    selected = null,
    tab = $bindable("shared"),
    diaryName = "",
    entryCount = 0,
    onHome = () => {},
    onCustomize = () => {},
    onProfile = () => {},
    onAppearance = () => {},
appearanceActive = false,
profileActive = false,
profileName = '',
profileAvatar = '',
  } = $props();
</script>

<aside
  class="md:w-60 md:min-h-screen bg-[#111112] border-b md:border-b-0 md:border-r border-[#302d31] p-5 flex flex-col gap-6 shrink-0"
>
  <button class="text-left" onclick={onHome}>
    <div class="serif text-2xl tracking-[.32em] text-[#e8c8c2]">ECHOES</div>
    <div class="text-[10px] tracking-[.12em] muted mt-2">A LIBRARY OF US</div>
  </button>

  {#if selected}
    <div class="border-t border-[#302d31] pt-5">
      <button
        class="flex items-center gap-2 text-xs muted hover:text-white"
        onclick={onHome}
      >
        <ArrowLeft size={15} />
        Back to diaries
      </button>

      <h2 class="serif text-xl mt-5 break-words">
        {diaryName}
      </h2>

      <p class="text-xs muted mt-2">
        {entryCount}
        {entryCount === 1 ? "entry" : "entries"}
      </p>
    </div>
  {/if}

  <nav class="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
{#if !selected}
  <button
    class="nav"
    class:active={!profileActive && !appearanceActive}
    onclick={onHome}
  >
    <Home size={17} />
    My Diaries
  </button>
{:else}
      <button
        class="nav"
        class:active={tab === "shared"}
        onclick={() => (tab = "shared")}
      >
        <Users size={17} />
        Shared Timeline
      </button>

      <button
        class="nav"
        class:active={tab === "personal"}
        onclick={() => (tab = "personal")}
      >
        <BookOpen size={17} />
        My Journal
      </button>

      <button
        class="nav"
        class:active={tab === "theirs"}
        onclick={() => (tab = "theirs")}
      >
        <BookHeart size={17} />
        Their Journals
      </button>

      <button
        class="nav"
        class:active={tab === "calendar"}
        onclick={() => (tab = "calendar")}
      >
        <CalendarDays size={17} />
        Calendar
      </button>

      <button
        class="nav"
        class:active={tab === "photos"}
        onclick={() => (tab = "photos")}
      >
        <Images size={17} />
        Photos
      </button>

      <button
  class="nav"
  class:active={tab === 'search'}
  onclick={() => (tab = 'search')}
>
  <Search size={17} />
  Search
</button>

<button
  class="nav"
  class:active={tab === 'members'}
  onclick={() => (tab = 'members')}
>
  <Users size={17} />
  Members
</button>

<button
  class="nav"
  class:active={tab === 'milestones'}
  onclick={() => (tab = 'milestones')}
>
  <CalendarHeart size={17} />
  Milestones
</button>

      <div class="hidden md:block border-t border-[#302d31] my-3"></div>

      <button class="nav" onclick={onCustomize}>
        <Settings size={17} />
        Diary Settings
      </button>
    {/if}
  </nav>

{#if !selected}
  <div class="border-t border-[#302d31] pt-4">
    <button
      type="button"
      class="nav"
      class:active={appearanceActive}
      onclick={onAppearance}
    >
      <Palette size={19} />
      Appearance
    </button>
  </div>
{/if}

<div class="border-t border-[#302d31] pt-4">
  <button
    type="button"
    class="nav"
    class:active={profileActive}
    onclick={onProfile}
  >
    {#if profileAvatar}
      <img
        src={profileAvatar}
        alt=""
        class="w-7 h-7 rounded-full object-cover"
      />
    {:else}
      <UserRound size={19} />
    {/if}

    <span class="truncate">
      {profileName || 'My Profile'}
    </span>
  </button>
</div>

  <div class="hidden md:block mt-auto">
    <Library size={18} class="text-[#c99d98] mb-3" />
    <p class="serif italic text-xs muted leading-relaxed">
      Different people. Different stories. One place.
    </p>
  </div>

  <p class="text-[10px] muted">LOCAL DEMO · NO ACCOUNT SYNC</p>
</aside>
