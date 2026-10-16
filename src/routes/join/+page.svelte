
<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase.js';

  let message = $state('Checking your invitation...');
  let error = $state('');

  onMount(async () => {
    const token = new URLSearchParams(
      window.location.search
    ).get('token');

    if (!token) {
      error = 'This invitation link is invalid.';
      return;
    }

    try {
      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        sessionStorage.setItem('pendingDiaryInvite', token);
        window.location.replace('/');
        return;
      }

      message = 'Joining your shared diary...';

      const { data: diaryId, error: joinError } =
        await supabase.rpc('join_diary_by_qr', {
          p_token: token
        });

      if (joinError) throw joinError;

      sessionStorage.setItem('joinedDiaryId', diaryId);
      window.location.replace('/');
    } catch (err) {
      error = err.message || 'Could not join this diary.';
    }
  });
</script>

<div class="flex min-h-screen items-center justify-center bg-[#100e13] p-6 text-center text-white">
  <div class="max-w-sm">
    {#if error}
      <h1 class="mb-3 text-xl font-semibold">
        Invitation unavailable
      </h1>
      <p class="text-sm text-red-300">{error}</p>
      <a href="/" class="mt-6 inline-block text-[#dca9a6]">
        Return to Echoes
      </a>
    {:else}
      <h1 class="mb-3 text-xl font-semibold">
        Welcome to Echoes
      </h1>
      <p class="text-sm text-white/60">{message}</p>
    {/if}
  </div>
</div>
