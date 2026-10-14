<script>
  import { ChevronLeft, ChevronRight, CalendarDays, List } from "lucide-svelte";

  let { diary } = $props();

  const today = new Date();
  let year = $state(today.getFullYear());
  let month = $state(today.getMonth());
  let mode = $state("month");
  let selectedDate = $state(null);

  let entries = $derived(
    [...(diary?.entries ?? [])]
      .filter(
        (e) =>
          e.date &&
          (e.type === "shared" ||
            e.author === "You" ||
            (e.type === "personal" && e.visibility === "shared")),
      )
      .sort((a, b) => b.date.localeCompare(a.date)),
  );

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function dateKey(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function changeMonth(amount) {
    const date = new Date(year, month + amount, 1);
    year = date.getFullYear();
    month = date.getMonth();
    selectedDate = null;
  }

  function changeYear(amount) {
    year += amount;
    selectedDate = null;
  }

  let days = $derived.by(() => {
    const offset = new Date(year, month, 1).getDay();
    const count = new Date(year, month + 1, 0).getDate();

    return [
      ...Array(offset).fill(null),
      ...Array.from({ length: count }, (_, i) => i + 1),
    ];
  });

  let visibleEntries = $derived(
    entries.filter((e) => {
      if (selectedDate) return e.date === selectedDate;
      if (mode === "list") return true;
      return e.date?.startsWith(
        `${year}-${String(month + 1).padStart(2, "0")}`,
      );
    }),
  );

  let monthTitle = $derived(
    new Date(year, month, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
  );

  function milestoneOccursOn(milestone, key) {
    if (!milestone.recurring) return milestone.date === key;

    const [originalYear, originalMonth, originalDay] = milestone.date
      .split("-")
      .map(Number);

    const [targetYear, targetMonth, targetDay] = key.split("-").map(Number);

    if (targetYear < originalYear) return false;

    // Observe February 29 milestones on March 1 in non-leap years.
    if (
      originalMonth === 2 &&
      originalDay === 29 &&
      new Date(targetYear, 1, 29).getMonth() !== 1
    ) {
      return targetMonth === 3 && targetDay === 1;
    }

    return originalMonth === targetMonth && originalDay === targetDay;
  }

  function milestonesOn(key) {
    return (diary?.milestones ?? []).filter((m) => milestoneOccursOn(m, key));
  }

  let visibleMilestones = $derived(
    selectedDate ? milestonesOn(selectedDate) : [],
  );
</script>

<div class="max-w-5xl mx-auto space-y-7">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <p class="uppercase tracking-[.2em] text-xs muted mb-2">
        A collection of days
      </p>
      <h2 class="serif text-4xl">Memory Calendar</h2>
      <p class="muted text-sm mt-2">Every date has a story to tell.</p>
    </div>

    <div class="flex gap-2">
      {#each ["month", "year", "list"] as option}
        <button
          class="chip"
          class:active={mode === option}
          onclick={() => {
            mode = option;
            selectedDate = null;
          }}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      {/each}
    </div>
  </div>

  {#if mode !== "list"}
    <div class="panel p-5 md:p-7">
      <div class="flex items-center justify-between mb-7">
        <button
          aria-label="Previous"
          class="btn"
          onclick={() => (mode === "month" ? changeMonth(-1) : changeYear(-1))}
        >
          <ChevronLeft size={18} />
        </button>

        <h3 class="serif text-2xl">
          {mode === "month" ? monthTitle : year}
        </h3>

        <button
          aria-label="Next"
          class="btn"
          onclick={() => (mode === "month" ? changeMonth(1) : changeYear(1))}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {#if mode === "month"}
        <div class="grid grid-cols-7 gap-1 md:gap-2">
          {#each weekdays as day}
            <div class="text-center muted text-xs py-2">{day}</div>
          {/each}

          {#each days as day, i}
            {#if day === null}
              <div class="min-h-14 md:min-h-24"></div>
            {:else}
              {@const key = dateKey(year, month, day)}
              {@const count = entries.filter((e) => e.date === key).length}
              {@const milestoneCount = milestonesOn(key).length}
              <button
                class="min-h-14 md:min-h-24 rounded-lg border text-left p-2 flex flex-col justify-between transition-colors hover:bg-[#30292b]"
                class:border-[#c99d98]={selectedDate === key}
                class:border-[#343035]={selectedDate !== key}
                class:bg-[#30292b]={selectedDate === key}
                onclick={() =>
                  (selectedDate = selectedDate === key ? null : key)}
              >
                <span class="text-xs">{day}</span>
                <div class="flex flex-wrap gap-1 items-center">
                  {#if count > 0}
                    <span
                      class="text-[#e8b2aa] text-xs"
                      title={`${count} entries`}
                    >
                      ● <span class="hidden sm:inline">{count}</span>
                    </span>
                  {/if}

                  {#if milestoneCount > 0}
                    <span
                      class="text-amber-300 text-xs"
                      title={`${milestoneCount} milestones`}
                    >
                      ♥ <span class="hidden sm:inline">{milestoneCount}</span>
                    </span>
                  {/if}
                </div>
              </button>
            {/if}
          {/each}
        </div>
      {:else}
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {#each Array.from({ length: 12 }, (_, i) => i) as m}
            {@const prefix = `${year}-${String(m + 1).padStart(2, "0")}`}
            {@const count = entries.filter((e) =>
              e.date.startsWith(prefix),
            ).length}
            <button
              class="rounded-xl border border-[#40383c] p-5 text-left hover:bg-[#30292b]"
              onclick={() => {
                month = m;
                mode = "month";
                selectedDate = null;
              }}
            >
              <div class="serif text-xl">
                {new Date(year, m, 1).toLocaleDateString("en-US", {
                  month: "long",
                })}
              </div>
              <p class="muted text-xs mt-2">
                {count}
                {count === 1 ? "memory" : "memories"}
              </p>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  {#if mode !== "year"}
    <section class="space-y-4">
      <div class="flex items-center gap-2">
        {#if mode === "list"}
          <List size={18} />
        {:else}
          <CalendarDays size={18} />
        {/if}

        <h3 class="serif text-2xl">
          {selectedDate ?? (mode === "list" ? "All Memories" : monthTitle)}
        </h3>
      </div>

      {#each visibleMilestones as milestone (milestone.id)}
        <div class="panel p-5 border-l-4 border-amber-300">
          <p class="text-xs text-amber-300 mb-2">♥ Special Milestone</p>
          <h3 class="serif text-2xl">{milestone.title}</h3>
          <p class="muted text-xs mt-2">
            {milestone.category}
            {milestone.recurring ? " · Yearly" : ""}
          </p>
        </div>
      {/each}

      {#each visibleEntries as entry (entry.id)}
        <article class="panel p-6">
          <p class="muted text-xs">
            {entry.date} · {entry.author}
          </p>
          <h4 class="serif text-2xl mt-3">{entry.title}</h4>
          <p class="text-sm whitespace-pre-wrap leading-7 mt-3 text-[#ded4d1]">
            {entry.body}
          </p>

          {#if entry.audio}
            <div class="mt-5 space-y-2">
              <p class="text-xs muted flex items-center gap-2">Voice Memory</p>

              <audio
                controls
                src={entry.audio}
                class="w-full"
                aria-label={`Voice memory from ${entry.title}`}
              ></audio>
            </div>
          {/if}

          {#if entry.photos?.length}
            <div
              class="grid gap-3 mt-5"
              class:grid-cols-2={entry.photos.length > 1}
            >
              {#each entry.photos as photo, index}
                <img
                  src={photo}
                  alt={`Photo ${index + 1} from ${entry.title}`}
                  loading="lazy"
                  class="w-full max-h-72 object-cover rounded-xl border border-[#40383c]"
                />
              {/each}
            </div>
          {/if}
        </article>
      {:else}
        <div class="panel p-10 text-center">
          <CalendarDays size={26} class="mx-auto mb-4" />
          <h3 class="serif text-xl">No memories for this period</h3>
          <p class="muted text-sm mt-2">
            Entries will appear here on the dates they were written.
          </p>
        </div>
      {/each}
    </section>
  {/if}
</div>
