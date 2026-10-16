
<script>
  import {
    Home,
    UserRound,
    Palette,
    Settings,
    LogOut,
    Library
  } from "lucide-svelte";

  let {
    activePage = "diaries",
    profileName = "",
    profileAvatar = "",
    onNavigate = () => {},
    onSignOut = () => {}
  } = $props();
</script>

<aside
  class="md:w-60 md:min-h-screen bg-[#111112] border-b md:border-b-0 md:border-r border-[#302d31] p-5 flex flex-col gap-6 shrink-0"
>
  <button class="text-left" onclick={() => onNavigate("diaries")}>
    <div class="serif text-2xl tracking-[.32em] text-[#e8c8c2]">ECHOES</div>
    <div class="text-[10px] tracking-[.12em] muted mt-2">A LIBRARY OF US</div>
  </button>

  <nav class="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
    <button class="nav" class:active={activePage === "diaries"} onclick={() => onNavigate("diaries")}>
      <Home size={17} />
      My Diaries
    </button>

    <button class="nav" class:active={activePage === "profile"} onclick={() => onNavigate("profile")}>
      {#if profileAvatar}
        <img src={profileAvatar} alt="" class="w-7 h-7 rounded-full object-cover" />
      {:else}
        <UserRound size={17} />
      {/if}
      <span class="truncate">{profileName || "My Profile"}</span>
    </button>

    <button class="nav" class:active={activePage === "appearance"} onclick={() => onNavigate("appearance")}>
      <Palette size={17} />
      Appearance
    </button>

    <button class="nav" class:active={activePage === "settings"} onclick={() => onNavigate("settings")}>
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
