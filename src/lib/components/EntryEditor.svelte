
<script>
  import {
  X, BookOpen, Lock, Users, ImagePlus, Trash2,
  Mic, Square, RotateCcw
} from 'lucide-svelte';

  let {
    entry = $bindable(),
    isEditing = false,
    onSave = () => {},
    onClose = () => {}
    
  } = $props();

  function changeType() {
    entry.visibility =
      entry.type === 'shared' ? 'shared' : 'private';
  }
  
let photoError = $state('');
let uploading = $state(false);

async function addPhotos(event) {
  const files = Array.from(event.currentTarget.files ?? []);
  photoError = '';

  if (!files.length) return;

  if ((entry.photos?.length ?? 0) + files.length > 5) {
    photoError = 'Maximum of 5 photos per entry.';
    event.currentTarget.value = '';
    return;
  }

  uploading = true;

  try {
    const compressed = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select image files only.');
      }

      if (file.size > 15 * 1024 * 1024) {
        throw new Error('Each original photo must be under 15 MB.');
      }

      const bitmap = await createImageBitmap(file);

      try {
        const scale = Math.min(
          1,
          900 / Math.max(bitmap.width, bitmap.height)
        );

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not process image.');

        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        const data = canvas.toDataURL('image/webp', 0.65);

        if (data.length > 450000) {
          throw new Error('Photo is still too large after compression.');
        }

        compressed.push(data);
      } finally {
        bitmap.close();
      }
    }

    entry.photos = [...(entry.photos ?? []), ...compressed];
  } catch (err) {
    photoError = err.message || 'Could not upload photos.';
  } finally {
    uploading = false;
    event.currentTarget.value = '';
  }
}

function removePhoto(index) {
  entry.photos = (entry.photos ?? []).filter((_, i) => i !== index);
}


let recording = $state(false);
let processingAudio = $state(false);
let audioError = $state('');
let recorder;
let microphoneStream;
let audioChunks = [];
let recordingTimer;
let recordingStartedAt = 0;
let recordingSeconds = $state(0);

const MAX_RECORDING_SECONDS = 20;

function stopMicrophone() {
  clearInterval(recordingTimer);
  microphoneStream?.getTracks().forEach(track => track.stop());
  microphoneStream = null;
}

async function startRecording() {
  audioError = '';

  if (!navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined') {
    audioError = 'Microphone recording is not supported in this browser.';
    return;
  }

  try {
    microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4'
    ];

    const mimeType = types.find(type => MediaRecorder.isTypeSupported(type));

    recorder = new MediaRecorder(
      microphoneStream,
      mimeType ? { mimeType, audioBitsPerSecond: 24000 } : {}
    );

    audioChunks = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size) audioChunks.push(event.data);
    };

    recorder.onstop = async () => {
      stopMicrophone();
      recording = false;
      processingAudio = true;

      try {
        const blob = new Blob(audioChunks, {
          type: recorder.mimeType || 'audio/webm'
        });

        if (blob.size > 250000) {
          throw new Error('Recording is too large for temporary browser storage.');
        }

        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Could not read recording.'));
          reader.readAsDataURL(blob);
        });

        entry.audio = dataUrl;
      } catch (err) {
        audioError = err.message || 'Could not process recording.';
      } finally {
        processingAudio = false;
      }
    };

    recorder.onerror = () => {
      audioError = 'An error occurred while recording.';
      stopMicrophone();
      recording = false;
    };

    recorder.start();
    recording = true;
    recordingSeconds = 0;
    recordingStartedAt = Date.now();

    recordingTimer = setInterval(() => {
      recordingSeconds = Math.floor(
        (Date.now() - recordingStartedAt) / 1000
      );

      if (recordingSeconds >= MAX_RECORDING_SECONDS) {
        stopRecording();
      }
    }, 250);
  } catch {
    audioError = 'Microphone access was denied or unavailable.';
    stopMicrophone();
  }
}

function stopRecording() {
  if (recorder?.state === 'recording') {
    recorder.stop();
  }
  stopMicrophone();
  recording = false;
}

function removeRecording() {
  entry.audio = null;
  audioError = '';
}


</script>

<div
  class="overlay"
  role="presentation"
  onclick={(e) => {
    if (e.target === e.currentTarget) onClose();
  }}
>
  <div class="modal">
    <div class="flex justify-between items-center mb-6">
      <div>
        <p class="text-xs muted uppercase tracking-[.2em] mb-2">
          A new memory
        </p>
        <h2 class="serif text-3xl">
  {isEditing ? 'Edit Entry' : 'New Entry'}
</h2>
      </div>

      <button aria-label="Close" onclick={onClose}>
        <X size={22} />
      </button>
    </div>

    <div class="space-y-5">
      <div>
        <label for="entry-title">Title</label>
        <input
          id="entry-title"
          class="field"
          placeholder="A day worth remembering"
          bind:value={entry.title}
        />
      </div>

      <div>
        <label for="entry-type">Writing space</label>
        <select
          id="entry-type"
          class="field"
          bind:value={entry.type}
          onchange={changeType}
        >
          <option value="shared">Shared Timeline</option>
          <option value="personal">My Journal</option>
        </select>
      </div>

      {#if entry.type === 'personal'}
        <div>
          <label for="entry-visibility">Visibility</label>
          <select
            id="entry-visibility"
            class="field"
            bind:value={entry.visibility}
          >
            <option value="private">Private — only me</option>
            <option value="shared">
              Published — diary members can read
            </option>
          </select>

          <p class="muted text-xs mt-2 flex gap-2 items-center">
            {#if entry.visibility === 'private'}
              <Lock size={13} />
              Only you can read this entry.
            {:else}
              <Users size={13} />
              Other diary members can read this entry.
            {/if}
          </p>
        </div>
      {/if}

      <div>
        <label for="entry-body">Your entry</label>
        <textarea
          id="entry-body"
          class="field min-h-64 leading-7"
          placeholder="Dear diary..."
          bind:value={entry.body}
        ></textarea>
      </div>

      
<!-- Voice Memory -->
<div class="space-y-4 rounded-xl border border-[#514449] p-5">
  <div class="flex items-center gap-2">
    <Mic size={18} />
    <div>
      <h3 class="serif text-xl">Voice Memory</h3>
      <p class="text-xs muted mt-1">
        Record a moment in your own voice.
      </p>
    </div>
  </div>

  {#if recording}
    <div class="flex items-center gap-3">
      <span class="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
      <span class="text-sm">
        Recording... {recordingSeconds}s / {MAX_RECORDING_SECONDS}s
      </span>
    </div>

    <button
      type="button"
      class="btn flex items-center gap-2"
      onclick={stopRecording}
    >
      <Square size={15} />
      Stop Recording
    </button>
  {:else if processingAudio}
    <p class="muted text-sm">Preparing recording...</p>
  {:else if entry.audio}
    <audio
      controls
      src={entry.audio}
      class="w-full"
      aria-label="Voice memory preview"
    ></audio>

    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="btn flex items-center gap-2"
        onclick={startRecording}
      >
        <RotateCcw size={15} />
        Re-record
      </button>

      <button
        type="button"
        class="btn flex items-center gap-2 text-red-300"
        onclick={removeRecording}
      >
        <Trash2 size={15} />
        Remove
      </button>
    </div>
  {:else}
    <button
      type="button"
      class="btn flex items-center gap-2"
      onclick={startRecording}
    >
      <Mic size={16} />
      Start Recording
    </button>
  {/if}

  {#if audioError}
    <p class="text-xs text-red-300">{audioError}</p>
  {/if}

  <p class="muted text-xs">
    Temporary limit: 20 seconds per entry.
    Longer recordings will be supported with cloud storage.
  </p>
</div>

<!-- Entry photos -->
<div class="space-y-3">
  <div class="flex items-center justify-between">
    <label for="entry-photos" class="flex items-center gap-2">
      <ImagePlus size={17} />
      Photos
    </label>

    <span class="text-xs muted">
      {entry.photos?.length ?? 0}/5 photos
    </span>
  </div>

  <input
    id="entry-photos"
    type="file"
    accept="image/*"
    multiple
    class="field text-xs"
    disabled={uploading || (entry.photos?.length ?? 0) >= 5}
    onchange={addPhotos}
  />

  <p class="text-xs muted">
    Add up to 5 photos. Images are compressed automatically.
  </p>

  {#if uploading}
    <p class="text-xs muted">Processing photos...</p>
  {/if}

  {#if photoError}
    <p class="text-xs text-red-300">{photoError}</p>
  {/if}

  {#if entry.photos?.length}
    <div class="grid grid-cols-3 gap-3">
      {#each entry.photos as photo, index}
        <div class="relative aspect-square">
          <img
            src={photo}
            alt={`Attachment ${index + 1}`}
            class="w-full h-full object-cover rounded-lg"
          />

          <button
            type="button"
            aria-label={`Remove photo ${index + 1}`}
            class="absolute top-1 right-1 bg-black/80 rounded-full p-2 text-white"
            onclick={() => removePhoto(index)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

      <div class="flex justify-between items-center gap-3">
        <span class="text-xs muted flex items-center gap-2">
          <BookOpen size={14} />
          {entry.body.trim().split(/\s+/).filter(Boolean).length}
          words
        </span>

        <div class="flex gap-2">
          <button class="btn" onclick={onClose}>
            Cancel
          </button>

          <button
            class="btn primary"
            disabled={uploading || recording || processingAudio || !entry.title.trim() || !entry.body.trim()}
            onclick={onSave}
          >
            {isEditing ? 'Save Changes' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
