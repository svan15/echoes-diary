<script>
  import { supabase } from "$lib/supabase";

  import {
    Heart,
    ArrowLeft,
    Eye,
    EyeOff,
    Mail,
    LockKeyhole,
    UserRound,
    BookHeart,
  } from "lucide-svelte";
  let { onPreview = () => {} } = $props();
  let mode = $state("login");
  let showPassword = $state(false);
  let email = $state("");
  let username = $state("");
  let password = $state("");
  let notice = $state("");
  const isRegister = $derived(mode === "register");
  function switchMode(next) {
    mode = next;
    notice = "";
    password = "";
    showPassword = false;
  }
  let loading = $state(false);

  async function submit(event) {
    event.preventDefault();

    if (loading) return;

    loading = true;
    notice = "";

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim(),
            },
          },
        });

        if (error) {
  if (
    error.message.includes('Database error saving new user') ||
    error.message.toLowerCase().includes('duplicate')
  ) {
    throw new Error(
      'Registration could not be completed. The username may already be taken. Please try another username.'
    );
  }

  throw error;
}

        notice = data.session
          ? "Account created successfully!"
          : "Account created! Check your email to confirm your account.";
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        notice = "Signed in successfully!";
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/reset-password`,
          },
        );

        if (error) throw error;

        notice =
          "If an account exists for this email, a recovery link will be sent.";
      }
    } catch (error) {
      notice = error.message || "Something went wrong. Please try again.";
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Welcome to Echoes</title></svelte:head>
<div class="min-h-screen grid lg:grid-cols-2 bg-[#101113] text-[#f2ece8]">
  <section
    class="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 xl:p-16 border-r border-white/10 bg-[radial-gradient(ellipse_at_20%_30%,#3a2035_0%,#1d151d_44%,#111114_85%)]"
  >
    <div class="flex items-center gap-3">
      <BookHeart size={22} class="text-[#dca9a6]" /><span
        class="tracking-[.25em] text-xs font-semibold">ECHOES</span
      >
    </div>
    <div class="max-w-lg">
      <p class="uppercase tracking-[.28em] text-xs text-[#dca9a6] mb-6">
        A library of us
      </p>
      <h1 class="serif text-6xl xl:text-7xl leading-[1.08]">
        Some moments<br />deserve to <em class="text-[#dca9a6]">stay.</em>
      </h1>
      <p class="mt-7 text-[#c5b7bf] leading-7 max-w-md">
        A quiet place to collect your stories, remember the little things, and
        keep the people you love close.
      </p>
    </div>
    <div class="flex items-center gap-2 text-xs text-[#a997a4]">
      <Heart size={14} /> Every story has a home.
    </div>
  </section>
  <section class="flex flex-col min-h-screen px-6 py-8 sm:px-12 lg:px-16">
    <div class="flex items-center justify-between lg:justify-end">
      <div class="flex lg:hidden items-center gap-2 text-sm tracking-[.2em]">
        <BookHeart size={20} class="text-[#dca9a6]" /> ECHOES
      </div>
      <button
        type="button"
        class="text-xs text-[#b9a8b1] hover:text-white underline underline-offset-4"
        onclick={onPreview}>Preview my diaries</button
      >
    </div>
    <div class="w-full max-w-[420px] mx-auto my-auto py-12">
      {#if mode === "reset"}
        <button
          type="button"
          class="flex items-center gap-2 text-sm text-[#b7a9b1] hover:text-white mb-8"
          onclick={() => switchMode("login")}
          ><ArrowLeft size={16} /> Back to sign in</button
        >
        <p class="text-[11px] tracking-[.25em] uppercase text-[#dca9a6] mb-3">
          Account recovery
        </p>
        <h2 class="serif text-4xl mb-3">Forgot your password?</h2>
        <p class="text-sm text-[#b9adb5] mb-8 leading-6">
          When Supabase is connected, we'll email you a secure password reset
          link.
        </p>
        <form onsubmit={submit} class="space-y-5">
          <div>
            <label for="reset-email">Email address</label><input
              id="reset-email"
              class="field"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              bind:value={email}
              required
            />
          </div>
          <button class="btn primary w-full py-3" type="submit"
            >Send reset link</button
          >
        </form>
      {:else}
        <p class="text-[11px] tracking-[.25em] uppercase text-[#dca9a6] mb-3">
          Your stories, kept close
        </p>
        <h2 class="serif text-4xl sm:text-5xl mb-3">
          {isRegister ? "Begin your story." : "Welcome back."}
        </h2>
        <p class="text-sm text-[#b9adb5] mb-8 leading-6">
          {isRegister
            ? "Create your own space for the moments that matter."
            : "Pick up right where your memories left off."}
        </p>
        <div
          class="grid grid-cols-2 gap-1 bg-[#1c1b1e] rounded-xl p-1 mb-7 border border-[#343337]"
        >
          <button
            type="button"
            class:active={!isRegister}
            class="auth-tab"
            onclick={() => switchMode("login")}>Sign in</button
          ><button
            type="button"
            class:active={isRegister}
            class="auth-tab"
            onclick={() => switchMode("register")}>Create account</button
          >
        </div>
        <form onsubmit={submit} class="space-y-4">
          {#if isRegister}<div>
              <label for="auth-username">Username</label>
              <div class="relative">
                <UserRound size={17} class="auth-input-icon" /><input
                  id="auth-username"
                  class="field auth-input"
                  placeholder="Choose a unique username"
                  minlength="3"
maxlength="20"
                  pattern="[a-zA-Z0-9_]+"
                  title="Use letters, numbers, and underscores only"
                  autocomplete="username"
                  bind:value={username}
                  required
                />
              </div>
              <p class="text-xs text-[#92868f] mt-2">
                3–24 characters · Letters, numbers and underscores
              </p>
            </div>{/if}
          <div>
            <label for="auth-email">Email address</label>
            <div class="relative">
              <Mail size={17} class="auth-input-icon" /><input
                id="auth-email"
                class="field auth-input"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                bind:value={email}
                required
              />
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between">
              <label for="auth-password">Password</label
              >{#if !isRegister}<button
                  type="button"
                  class="text-xs text-[#dca9a6] hover:underline mb-1"
                  onclick={() => switchMode("reset")}>Forgot password?</button
                >{/if}
            </div>
            <div class="relative">
              <LockKeyhole size={17} class="auth-input-icon" /><input
                id="auth-password"
                class="field auth-input pr-12"
                type={showPassword ? "text" : "password"}
                autocomplete={isRegister ? "new-password" : "current-password"}
                minlength={isRegister ? 8 : undefined}
                placeholder="At least 8 characters"
                bind:value={password}
                required
              /><button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#a99ca5] hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onclick={() => (showPassword = !showPassword)}
                >{#if showPassword}<EyeOff size={18} />{:else}<Eye
                    size={18}
                  />{/if}</button
              >
            </div>
          </div>
          <button class="btn primary w-full py-3 mt-2" type="submit"
            >{isRegister ? "Create account" : "Sign in"}</button
          >
        </form>
        <div class="flex items-center gap-4 my-7">
          <div class="h-px bg-white/10 flex-1"></div>
          <span class="text-xs text-[#958993]">or continue with</span>
          <div class="h-px bg-white/10 flex-1"></div>
        </div>
        <button
          type="button"
          class="btn w-full flex items-center justify-center gap-3 py-3 hover:bg-[#393438]"
          onclick={() =>
            (notice =
              "Google sign-in will be enabled when Supabase OAuth is connected.")}
          ><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"
            ><path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            /><path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.89 46.98 24.55z"
            /><path
              fill="#FBBC05"
              d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19z"
            /><path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
            /></svg
          >Continue with Google</button
        >
      {/if}
      {#if notice}<div
          role="status"
          class="mt-6 rounded-lg border border-[#76565f] bg-[#39252d] px-4 py-3 text-sm text-[#f3dadd] leading-6"
        >
          {notice}
        </div>{/if}
      <p class="text-xs text-center text-[#8f848d] mt-8">
        A private space for every chapter of your story.
      </p>
    </div>
    <p class="text-center text-[11px] text-[#6f6870]">
      Echoes · Made for moments worth keeping
    </p>
  </section>
</div>

<style>
  .auth-tab {
    border-radius: 9px;
    padding: 10px 8px;
    color: #a99ca5;
    font-size: 13px;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .auth-tab.active {
    background: #373036;
    color: #fff;
  }
  .auth-input {
    padding-left: 40px;
  }
  .auth-input-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: #9b8d97;
    pointer-events: none;
  }
</style>
