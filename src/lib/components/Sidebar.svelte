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
    Menu,
    X,
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
    profileName = "",
    profileAvatar = "",
  } = $props();
  let mobileMenuOpen = $state(false);
</script>

<button
  type="button"
  class="md:hidden fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-[#514449] bg-[#211d22] text-[#e8c8c2] shadow-lg"
  onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
  aria-label={mobileMenuOpen
    ? "Close diary navigation"
    : "Open diary navigation"}
  aria-expanded={mobileMenuOpen}
>
  {#if mobileMenuOpen}
    <X size={22} />
  {:else}
    <Menu size={22} />
  {/if}
</button>

{#if mobileMenuOpen}
  <button
    type="button"
    class="fixed inset-0 z-30 bg-black/60 md:hidden"
    aria-label="Close diary navigation"
    onclick={() => (mobileMenuOpen = false)}
  ></button>
{/if}

<aside
  class={`fixed inset-y-0 left-0 z-40 w-64 max-w-[85vw] h-screen overflow-y-auto bg-[#111112] border-r border-[#302d31] p-5 flex flex-col gap-6 shrink-0 transition-transform duration-300 ease-in-out md:sticky md:top-0 md:w-60 md:h-screen md:translate-x-0md:static md:w-60 md:min-h-screen md:h-auto md:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
>
  <button class="text-left" onclick={onHome}>
    <div class="serif text-2xl tracking-[.32em] text-[#e8c8c2]">ECHOES</div>
    <div class="text-[10px] tracking-[.12em] muted mt-2">A LIBRARY OF US</div>
  </button>

  {#if selected}
    <div class="border-t border-[#302d31] pt-5">
      <h2 class="serif text-xl break-words">
        {diaryName}
      </h2>

      <p class="text-xs muted mt-2">
        {entryCount}
        {entryCount === 1 ? "entry" : "entries"}
      </p>
    </div>
  {/if}

  <nav class="flex flex-col gap-2">
    {#if !selected}
      <button
        class="nav"
        class:active={!profileActive && !appearanceActive}
        onclick={() => {
  mobileMenuOpen = false;
  onHome();
}}
      >
        <Home size={17} />
        My Diaries
      </button>
    {:else}
      <button
        class="nav"
        class:active={tab === "shared"}
        onclick={() => {
  tab = "shared";
  mobileMenuOpen = false;
}}
      >
        <Users size={17} />
        Shared Timeline
      </button>

      <button
        class="nav"
        class:active={tab === "personal"}
        onclick={() => {
  tab = "personal";
  mobileMenuOpen = false;
}}
      >
        <BookOpen size={17} />
        My Journal
      </button>

      <button
        class="nav"
        class:active={tab === "theirs"}
        onclick={() => {
  tab = "theirs";
  mobileMenuOpen = false;
}}
      >
        <BookHeart size={17} />
        Their Journals
      </button>

      <button
        class="nav"
        class:active={tab === "calendar"}
        onclick={() => {
  tab = "calendar";
  mobileMenuOpen = false;
}}
      >
        <CalendarDays size={17} />
        Calendar
      </button>

      <button
        class="nav"
        class:active={tab === "photos"}
        onclick={() => {
  tab = "photos";
  mobileMenuOpen = false;
}}
      >
        <Images size={17} />
        Photos
      </button>

      <button
        class="nav"
        class:active={tab === "search"}
        onclick={() => {
  tab = "search";
  mobileMenuOpen = false;
}}
      >
        <Search size={17} />
        Search
      </button>

      <button
        class="nav"
        class:active={tab === "members"}
        onclick={() => {
  tab = "members";
  mobileMenuOpen = false;
}}
      >
        <Users size={17} />
        Members
      </button>

      <button
        class="nav"
        class:active={tab === "milestones"}
        onclick={() => {
  tab = "milestones";
  mobileMenuOpen = false;
}}
      >
        <CalendarHeart size={17} />
        Milestones
      </button>

      <div class="hidden md:block border-t border-[#302d31] my-3"></div>

      <button class="nav" onclick={() => {
  mobileMenuOpen = false;
  onCustomize();
}}>
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
        onclick={() => {
  mobileMenuOpen = false;
  onAppearance();
}}
      >
        <Palette size={19} />
        Appearance
      </button>
    </div>
  {/if}

  <div class="hidden md:block mt-auto">
    <Library size={18} class="text-[#c99d98] mb-3" />

    <p class="serif italic text-xs muted leading-relaxed">
      Different people. Different stories. One place.
    </p>
  </div>
</aside>
