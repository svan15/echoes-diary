
<script>
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';

  let copyNotice = $state('');
let copyNoticeTimer;

function showCopyNotice(message) {
  copyNotice = message;

  clearTimeout(copyNoticeTimer);

  copyNoticeTimer = setTimeout(() => {
    copyNotice = '';
  }, 3000);
}


  let {
    inviteUrl = '',
    onClose = () => {}
  } = $props();

  let qrImage = $state('');
  let error = $state('');

  onMount(async () => {
    try {
      qrImage = await QRCode.toDataURL(inviteUrl, {
        width: 280,
        margin: 2,
        errorCorrectionLevel: 'H'
      });
    } catch (err) {
      error = 'Could not generate QR code.';
      console.error(err);
    }
  });

async function copyLink() {
  try {
    await navigator.clipboard.writeText(inviteUrl);
    showCopyNotice('Invitation link copied!');
  } catch {
    showCopyNotice('Could not copy invitation link.');
  }
}
</script>

{#if copyNotice}
  <div
    role="status"
    aria-live="polite"
    class="fixed bottom-6 left-1/2 z-[100] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border border-[#76565f] bg-[#39252d] px-5 py-3 text-center text-sm text-[#f3dadd] shadow-2xl"
  >
    {copyNotice}
  </div>
{/if}

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
  <div class="w-full max-w-sm rounded-3xl border border-white/10 bg-[#18151c] p-6 text-center shadow-2xl">

    <div class="mb-5 flex items-center justify-between">
      <h2 class="text-xl font-semibold text-white">
        Share Diary
      </h2>

      <button
        type="button"
        onclick={onClose}
        class="text-2xl text-white/60 hover:text-white"
        aria-label="Close"
      >
        &times;
      </button>
    </div>

    <p class="mb-5 text-sm text-white/60">
      Scan this QR code to join this shared diary.
      Up to 15 participants are allowed.
    </p>

    {#if qrImage}
      <div class="mx-auto mb-5 w-fit rounded-2xl bg-white p-4">
        <img
          src={qrImage}
          alt="Diary invitation QR code"
          class="h-56 w-56"
        />
      </div>
    {:else if error}
      <p class="mb-5 text-sm text-red-400">{error}</p>
    {:else}
      <p class="mb-5 text-white/50">Generating QR code...</p>
    {/if}

    <button
      type="button"
      onclick={copyLink}
      class="w-full rounded-xl bg-[#dca9a6] px-4 py-3 font-medium text-[#18151c] hover:opacity-90"
    >
      Copy Invitation Link
    </button>

    <p class="mt-4 text-xs text-white/40">
      This QR code stays the same until the owner resets it.
    </p>
  </div>
</div>
