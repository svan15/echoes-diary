
<script>
  import {
    Home,
    UserRound,
    Palette,
    Settings,
    LogOut,
    Library,
    Menu,
    X
  } from "lucide-svelte";

  let {
    activePage = "diaries",
    profileName = "",
    profileAvatar = "",
    onNavigate = () => {},
    onSignOut = () => {}
  } = $props();
  let mobileMenuOpen = $state(false);
</script>

<button
  type="button"
  class="md:hidden fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-[#514449] bg-[#211d22] text-[#e8c8c2] shadow-lg"
  onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
  aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
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
    aria-label="Close navigation menu"
    onclick={() => (mobileMenuOpen = false)}
  ></button>
{/if}

<aside
  class="fixed inset-y-0 left-0 z-40 w-64 h-screen overflow-y-auto bg-[#111112] border-r border-[#302d31] p-5 flex flex-col gap-6 shrink-0 transition-transform duration-300 ease-in-out md:sticky md:top-0 md:w-60 md:h-screen md:translate-x-0"
  class:-translate-x-full={!mobileMenuOpen}
  class:translate-x-0={mobileMenuOpen}
>
  <button class="text-left" onclick={() => {
  mobileMenuOpen = false;
  onNavigate("diaries");
}}>
    <div class="serif text-2xl tracking-[.32em] text-[#e8c8c2]">ECHOES</div>
    <div class="text-[10px] tracking-[.12em] muted mt-2">A LIBRARY OF US</div>
  </button>

  <nav class="flex flex-col gap-2">
    <button class="nav" class:active={activePage === "diaries"} onclick={() => {
    mobileMenuOpen = false;
    onNavigate("diaries");
}}>
      <Home size={17} />
      My Diaries
    </button>

    <button class="nav" class:active={activePage === "profile"} onclick={() => {
    mobileMenuOpen = false;
    onNavigate("profile");
}}>
      {#if profileAvatar}
        <img src={profileAvatar} alt="" class="w-7 h-7 rounded-full object-cover" />
      {:else}
        <UserRound size={17} />
      {/if}
      <span class="truncate">{profileName || "My Profile"}</span>
    </button>

    <button class="nav" class:active={activePage === "appearance"} onclick={() => {
    mobileMenuOpen = false;
    onNavigate("appearance");
}}>
      <Palette size={17} />
      Appearance
    </button>

    <button class="nav" class:active={activePage === "settings"} onclick={() => {
    mobileMenuOpen = false;
    onNavigate("settings");
}}>
      <Settings size={17} />
      Settings
    </button>
  </nav>

  <div class="border-t border-[#302d31] pt-4">
    <button type="button" class="nav" onclick={onSignOut}>
      <LogOut size={17} />
      Sign Out
    </button>
  </div>

  <div class="hidden md:block mt-auto">
    <Library size={18} class="text-[#c99d98] mb-3" />
    <p class="serif italic text-xs muted leading-relaxed">
      Different people. Different stories. One place.
    </p>
  </div>
</aside>
