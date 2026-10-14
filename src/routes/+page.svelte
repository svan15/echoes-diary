<script>
    import Sidebar from "$lib/components/Sidebar.svelte";
    import AuthScreen from "$lib/components/AuthScreen.svelte";
    import DiaryLibrary from "$lib/components/DiaryLibrary.svelte";
    import DiaryView from "$lib/components/DiaryView.svelte";
    import EntryEditor from "$lib/components/EntryEditor.svelte";
    import DiarySettings from "$lib/components/DiarySettings.svelte";
import UserProfile from "$lib/components/UserProfile.svelte";
import AppAppearance from "$lib/components/AppAppearance.svelte";


    import { onMount } from "svelte";
    import {
        BookOpen,
        Plus,
        Home,
        Settings,
        ArrowLeft,
        Users,
        Heart,
        Lock,
        PenLine,
        CalendarDays,
        X,
        ImagePlus,
        Trash2,
        Search,
        BookHeart,
        Check,
        LogOut,
    } from "lucide-svelte";
    import { starter, newId } from "$lib/data";
    let authPreview = $state(false);
    let diaries = $state([]),
        selected = $state(null),
        tab = $state("shared"),
        modal = $state(""),
        editing = $state(null);
    let draft = $state({
        name: "",
        kind: "Couple",
        description: "",
        accent: "#dca9a6",
        cover: "",
        background: "",
    });
    let entry = $state({
        title: "",
        body: "",
        type: "shared",
        visibility: "shared",
    });
    let editingEntryId = $state(null);
    let profileOpen = $state(false);
let appearanceOpen = $state(false);
let appAccent = $state("#dca9a6");
let profile = $state({
    displayName: "",
    username: "",
    bio: "",
    avatar: "",
    theme: "rose",
});
    let ready = $state(false),
        error = $state("");
        
    onMount(() => {
        try {
            let raw = localStorage.getItem("echoes-prototype-v1");
            diaries = raw ? JSON.parse(raw) : structuredClone(starter);
        } catch {
            diaries = structuredClone(starter);
        }
        try {
    const savedProfile = localStorage.getItem("echoes-profile-v1");

    if (savedProfile) {
        profile = {
            ...profile,
            ...JSON.parse(savedProfile),
        };
    }
} catch {
    console.warn("Could not load saved profile.");
}

try {
    const savedAccent = localStorage.getItem("echoes-app-accent-v1");

    if (savedAccent && /^#[0-9a-fA-F]{6}$/.test(savedAccent)) {
        appAccent = savedAccent;
    }
} catch {
    console.warn("Could not load appearance preference.");
}
        ready = true;
    });
    $effect(() => {
        if (ready && typeof localStorage !== "undefined") {
            try {
                localStorage.setItem(
                    "echoes-prototype-v1",
                    JSON.stringify(diaries),
                );
            } catch {
                error =
                    "Storage is full. Use smaller images or remove some uploads.";
            }
        }
    });
    let current = $derived(diaries.find((d) => d.id === selected));

function saveAppAppearance(color) {
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) return;

    try {
        localStorage.setItem("echoes-app-accent-v1", color);
        appAccent = color;
    } catch {
        alert("Could not save appearance preference.");
    }
}

function saveProfile(updatedProfile) {
    try {
        localStorage.setItem(
            "echoes-profile-v1",
            JSON.stringify(updatedProfile),
        );

        profile = { ...updatedProfile };
    } catch {
        alert("Could not save profile. Browser storage may be full.");
    }
}

    function openCreate() {
        draft = {
            name: "",
            kind: "Couple",
            description: "",
            accent: "#dca9a6",
            cover: "",
            background: "",
        };
        editing = null;
        modal = "diary";
        error = "";
    }
    function openSettings() {
        draft = {
            name: current.name,
            kind: current.kind,
            description: current.description,
            accent: current.accent,
            cover: current.cover,
            background: current.background,
        };
        editing = current.id;
        modal = "diary";
        error = "";
    }
    function saveDiary() {
        if (!draft.name.trim()) return;
        if (editing) {
            diaries = diaries.map((d) =>
                d.id === editing
                    ? { ...d, ...draft, name: draft.name.trim() }
                    : d,
            );
        } else {
            let d = {
                ...draft,
                id: newId(),
                name: draft.name.trim(),
                members: ["You"],
                entries: [],
                milestones: [],
            };
            diaries = [d, ...diaries];
            selected = d.id;
            tab = "shared";
        }
        modal = "";
    }
    function openEntry() {
        editingEntryId = null;

        entry = {
            title: "",
            body: "",
            type: tab === "shared" ? "shared" : "personal",
            visibility: tab === "shared" ? "shared" : "private",
            photos: [],
            audio: null,
        };

        modal = "entry";
    }

    function editEntry(existingEntry) {
        if (existingEntry.author !== "You") return;

        editingEntryId = existingEntry.id;

        entry = {
            photos: [...(existingEntry.photos ?? [])],
            title: existingEntry.title,
            body: existingEntry.body,
            type: existingEntry.type,
            visibility: existingEntry.visibility,
            audio: existingEntry.audio ?? null,
        };

        modal = "entry";
    }

    function deleteEntry(entryId) {
        const existingEntry = current?.entries.find((e) => e.id === entryId);

        if (!existingEntry || existingEntry.author !== "You") return;

        if (!confirm("Delete this entry permanently?")) return;

        diaries = diaries.map((d) =>
            d.id === selected
                ? {
                      ...d,
                      entries: d.entries.filter((e) => e.id !== entryId),
                  }
                : d,
        );
    }

    function saveEntry() {
        if (!entry.title.trim() || !entry.body.trim()) return;

        if (editingEntryId) {
            diaries = diaries.map((d) =>
                d.id === selected
                    ? {
                          ...d,
                          entries: d.entries.map((e) =>
                              e.id === editingEntryId && e.author === "You"
                                  ? {
                                        ...e,
                                        title: entry.title.trim(),
                                        body: entry.body.trim(),
                                        type: entry.type,
                                        visibility: entry.visibility,
                                        photos: [...(entry.photos ?? [])],
                                        audio: entry.audio ?? null,
                                    }
                                  : e,
                          ),
                      }
                    : d,
            );
        } else {
            const newEntry = {
                ...entry,
                id: newId(),
                author: "You",
                date: new Date().toLocaleDateString("en-CA"),
            };

            diaries = diaries.map((d) =>
                d.id === selected
                    ? { ...d, entries: [newEntry, ...d.entries] }
                    : d,
            );
        }

        tab = entry.type;
        editingEntryId = null;
        modal = "entrySaved";

        setTimeout(() => {
            if (modal === "entrySaved") modal = "";
        }, 850);
    }

    function toggleReaction(entryId) {
        diaries = diaries.map((diary) =>
            diary.id === selected
                ? {
                      ...diary,
                      entries: diary.entries.map((e) =>
                          e.id === entryId &&
                          (e.type === "shared" || e.visibility === "shared")
                              ? { ...e, likedByYou: !e.likedByYou }
                              : e,
                      ),
                  }
                : diary,
        );
    }

    function addComment(entryId, text) {
        const cleaned = text.trim();
        if (!cleaned) return;

        diaries = diaries.map((diary) =>
            diary.id === selected
                ? {
                      ...diary,
                      entries: diary.entries.map((e) =>
                          e.id === entryId &&
                          (e.type === "shared" || e.visibility === "shared")
                              ? {
                                    ...e,
                                    comments: [
                                        ...(e.comments ?? []),
                                        {
                                            id: newId(),
                                            author: "You",
                                            text: cleaned,
                                            createdAt: new Date().toISOString(),
                                        },
                                    ],
                                }
                              : e,
                      ),
                  }
                : diary,
        );
    }

    function deleteComment(entryId, commentId) {
        diaries = diaries.map((diary) =>
            diary.id === selected
                ? {
                      ...diary,
                      entries: diary.entries.map((e) =>
                          e.id === entryId
                              ? {
                                    ...e,
                                    comments: (e.comments ?? []).filter(
                                        (comment) =>
                                            comment.id !== commentId ||
                                            comment.author !== "You",
                                    ),
                                }
                              : e,
                      ),
                  }
                : diary,
        );
    }


function saveMilestone(milestone) {
    if (!current || !milestone.title.trim() || !milestone.date) return;

    const saved = {
        ...milestone,
        id: milestone.id ?? newId()
    };

    diaries = diaries.map((d) => {
        if (d.id !== selected) return d;

        const existing = d.milestones ?? [];

        return {
            ...d,
            milestones: milestone.id
                ? existing.map((m) =>
                      m.id === milestone.id ? saved : m
                  )
                : [...existing, saved]
        };
    });
}

function deleteMilestone(id) {
    diaries = diaries.map((d) =>
        d.id === selected
            ? {
                  ...d,
                  milestones: (d.milestones ?? []).filter(
                      (m) => m.id !== id
                  )
              }
            : d
    );
}


    function addMember(name) {
        if (!current) return;

        const cleaned = name.trim();
        if (!cleaned) return;

        diaries = diaries.map((d) =>
            d.id === selected &&
            !(d.members ?? []).some(
                (m) => m.toLowerCase() === cleaned.toLowerCase(),
            )
                ? {
                      ...d,
                      members: [...(d.members ?? []), cleaned],
                  }
                : d,
        );
    }

    function removeMember(name) {
        if (!current || name === "You") return;

        diaries = diaries.map((d) =>
            d.id === selected
                ? {
                      ...d,
                      members: (d.members ?? []).filter((m) => m !== name),
                  }
                : d,
        );
    }

    function removeDiary() {
        if (
            !confirm("Delete this diary and all its entries from this browser?")
        )
            return;
        diaries = diaries.filter((d) => d.id !== selected);
        selected = null;
        modal = "";
    }

    async function fileToData(e, key) {
        const file = e.currentTarget.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            error = "Please choose an image file.";
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            error = "Please choose an image under 15 MB.";
            return;
        }

        try {
            const image = await createImageBitmap(file);

            const maxDimension = 1200;
            const scale = Math.min(
                1,
                maxDimension / Math.max(image.width, image.height),
            );

            const canvas = document.createElement("canvas");
            canvas.width = Math.round(image.width * scale);
            canvas.height = Math.round(image.height * scale);

            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Canvas unavailable");

            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            image.close();

            const compressedImage = canvas.toDataURL("image/webp", 0.75);

            if (compressedImage.length > 1200000) {
                error = "This image is still too large after compression.";
                return;
            }

            draft = { ...draft, [key]: compressedImage };
            error = "";
        } catch (err) {
            console.error("Image compression failed:", err);
            error = "Could not process this image. Try another photo.";
        }
    }

    const colors = [
        "#dca9a6",
        "#d9b781",
        "#9fc9b5",
        "#92b9d3",
        "#b4a4da",
        "#d2a0ca",
        "#e8ddd0",
        "#a3a7a9",
    ];
</script>

<svelte:head
    ><title>Echoes — A Library of Us</title><meta
        name="description"
        content="An intimate space for every story you share."
    /></svelte:head
>
{#if !authPreview}
<AuthScreen onPreview={() => (authPreview = true)} />
{:else}
<div
    class="min-h-screen md:flex"
    style={`--accent:${current && !profileOpen && !appearanceOpen ? current.accent : appAccent}`}
>
<Sidebar
    {selected}
    bind:tab
    diaryName={current?.name ?? ""}
    entryCount={current?.entries?.length ?? 0}
 onHome={() => {
    selected = null;
    profileOpen = false;
    appearanceOpen = false;
}}
    onCustomize={() => {
        profileOpen = false;
        openSettings();
    }}
onProfile={() => {
    profileOpen = true;
    appearanceOpen = false;
}}
onAppearance={() => {
    selected = null;
    profileOpen = false;
    appearanceOpen = true;
}}
appearanceActive={appearanceOpen}
/>
    <main class="flex-1 min-w-0 p-5 md:p-9 lg:p-12">
{#if appearanceOpen}
    <AppAppearance accent={appAccent} onSave={saveAppAppearance} />
{:else if profileOpen}
    <UserProfile {profile} onSave={saveProfile} />
{:else if !current}
    <DiaryLibrary
                {diaries}
                onCreate={openCreate}
onOpen={(id) => {
    selected = id;
    appearanceOpen = false;
    tab = "shared";
    profileOpen = false;
}}
            />
        {:else}
            <DiaryView
                diary={current}
                bind:tab
                onBack={() => (selected = null)}
                onCustomize={openSettings}
                onWrite={openEntry}
                onEdit={editEntry}
                onDelete={deleteEntry}
                onAddMember={addMember}
                onRemoveMember={removeMember}
                onToggleReaction={toggleReaction}
                onAddComment={addComment}
                onDeleteComment={deleteComment}
                onSaveMilestone={saveMilestone}
onDeleteMilestone={deleteMilestone}
            />
        {/if}
    </main>
</div>

{#if modal === "diary"}
    <DiarySettings
        bind:draft
        {editing}
        {error}
        {colors}
        onClose={() => (modal = "")}
        onSave={saveDiary}
        onDelete={removeDiary}
        onImageUpload={fileToData}
    />
{/if}

{#if modal === "entry"}
    <EntryEditor
        bind:entry
        isEditing={editingEntryId !== null}
        onSave={saveEntry}
        onClose={() => (modal = "")}
    />
{/if}

{#if modal === "entrySaved"}<div
        class="fixed bottom-5 right-5 bg-[#284b39] rounded-xl p-4 flex gap-2 items-center shadow-xl"
    >
        <Check size={18} /> Entry saved
    </div>{/if}

{/if}
