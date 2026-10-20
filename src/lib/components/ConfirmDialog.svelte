
<script>
  let {
    open = false,
    title = 'Are you sure?',
    message = '',
    warning = '',
    confirmText = 'Confirm',
    onConfirm = () => {},
    onCancel = () => {}
  } = $props();
</script>

{#if open}
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      class="w-full max-w-sm rounded-2xl border border-[#454247] bg-[#111215] p-5 shadow-2xl"
    >
      <h2 id="confirm-dialog-title" class="serif text-2xl text-[#f7f0ee]">
        {title}
      </h2>

      <p id="confirm-dialog-message" class="mt-3 text-sm leading-6 text-[#c7babb]">
        {message}
      </p>

      {#if warning}
        <p class="mt-3 rounded-lg bg-[#24201d] p-3 text-xs leading-5 text-[#e9b86c]">
          {warning}
        </p>
      {/if}

      <div class="mt-6 flex justify-end gap-2">
        <button
          type="button"
          class="rounded-lg bg-[#28272b] px-4 py-2 text-sm text-[#f7f0ee]"
          onclick={onCancel}
        >
          Cancel
        </button>

        <button
          type="button"
          class="rounded-lg bg-[#a65d54] px-4 py-2 text-sm font-medium text-white"
          onclick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}
