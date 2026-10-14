<script>


import { supabase } from '$lib/supabase';
import { uploadDiaryMedia } from '$lib/diaryCloud';




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
let authLoading = $state(true);
let session = $state(null);

onMount(() => {
  let active = true;

  const { data: { subscription } } =
    supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;

session = newSession;
authLoading = false;

if (newSession?.user?.id) {
  loadSupabaseProfile(newSession.user.id);

  loadCloudDiaries(newSession.user.id);
}
    });

  supabase.auth.getSession().then(({ data, error }) => {
    if (!active) return;

    if (error) {
      console.error('Could not restore session:', error.message);
    } else {
  session = data.session;

if (data.session?.user?.id) {
  loadSupabaseProfile(data.session.user.id);
  loadCloudDiaries(data.session.user.id);
}
    }

    authLoading = false;
  }).catch((error) => {
    if (!active) return;
    console.error('Session check failed:', error);
    authLoading = false;
  });

  return () => {
    active = false;
    subscription.unsubscribe();
  };
});

async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign out failed:', error.message);
    alert('Could not sign out. Please try again.');
    return;
  }

  selected = null;
  profileOpen = false;
  appearanceOpen = false;
  modal = '';
}
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



async function uploadProfileAvatar(userId, dataUrl) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  const path = `${userId}/profile.webp`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, blob, {
      contentType: 'image/webp',
      upsert: true,
      cacheControl: '0'
    });

  if (error) throw new Error(error.message);

  return path;
}

async function getAvatarSignedUrl(path) {
  if (!path) return '';

  const { data, error } = await supabase.storage
    .from('avatars')
    .createSignedUrl(path, 60 * 60);

  if (error) {
    console.error('Could not load avatar:', error.message);
    return '';
  }

  return data.signedUrl;
}


function formatCloudDiary(diary, entries = [], milestones = []) {
  return {
    id: diary.legacy_id || diary.id,
    cloudId: diary.id,
    name: diary.name,
    description: diary.description || '',
    kind: diary.kind === 'personal' ? 'Personal' : 'Couple',
    accent: diary.accent || '#dca9a6',
    cover: diary.cover || '',
    background: diary.background || '',
    members: ['You'],

    entries: entries.map(memory => ({
      id: memory.legacy_id || memory.id,
      cloudId: memory.id,
      title: memory.title || '',
      body: memory.body || '',
      type: memory.type || 'shared',
      visibility: memory.visibility || 'shared',
      author: 'You',
      date: memory.entry_date?.slice(0, 10) || '',
      photos: memory.photos || [],
      audio: memory.audio || null,
      likedByYou: memory.liked_by_you || false,
      comments: memory.comments || []
    })),

    milestones: milestones.map(milestone => ({
      id: milestone.legacy_id || milestone.id,
      cloudId: milestone.id,
      title: milestone.title || '',
      date: milestone.milestone_date || '',
      category: milestone.category || '',
      notes: milestone.notes || '',
      recurring: milestone.recurrence === 'yearly'
    }))
  };
}


async function loadCloudDiaries(userId) {
  const { data: cloudDiaries, error: diaryError } = await supabase
    .from('diaries')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (diaryError) {
    console.error('[Echoes Cloud] Could not load diaries:', diaryError);
    return;
  }

const formattedDiaries = [];

  for (const diary of cloudDiaries ?? []) {
    const { data: entries, error: entryError } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('diary_id', diary.id);

    if (entryError) {
      console.error('[Echoes Cloud] Could not load memories:', entryError);
      return;
    }

    const { data: milestones, error: milestoneError } = await supabase
      .from('diary_milestones')
      .select('*')
      .eq('diary_id', diary.id);

    if (milestoneError) {
      console.error('[Echoes Cloud] Could not load milestones:', milestoneError);
      return;
    }

formattedDiaries.push(
  formatCloudDiary(diary, entries, milestones)
);


  }

  if (session?.user?.id !== userId) return;


}




async function loadSupabaseProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, display_name, bio, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Could not load profile:', error.message);
    return;
  }

  const avatar = data?.avatar_url
    ? await getAvatarSignedUrl(data.avatar_url)
    : '';

  if (session?.user?.id !== userId) return;

  profile = {
    ...profile,
    displayName: data?.display_name ?? '',
    username: data?.username ?? '',
    bio: data?.bio ?? '',
    avatar
  };
}


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
const localProfile = JSON.parse(savedProfile);

profile = {
  ...profile,
  theme: localProfile.theme ?? 'rose'
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



async function saveProfile(updatedProfile) {
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Please sign in to save your profile.');
  }

  // Read the currently saved avatar path.
  const { data: existing, error: readError } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single();

  if (readError) throw new Error(readError.message);

  let avatarPath = existing.avatar_url;
  let avatar = updatedProfile.avatar;

  // New image selected in the editor.
  if (avatar?.startsWith('data:image/')) {
    avatarPath = await uploadProfileAvatar(userId, avatar);
    avatar = await getAvatarSignedUrl(avatarPath);

    if (!avatar) {
      throw new Error('Avatar uploaded but could not be displayed.');
    }
  } else if (!avatar) {
    // User clicked Remove profile photo.
    avatarPath = null;
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      username: updatedProfile.username,
      display_name: updatedProfile.displayName,
      bio: updatedProfile.bio,
      avatar_url: avatarPath
    })
    .eq('id', userId);

  if (error) {
    if (error.code === '23505') {
      throw new Error(
        'This username is already taken. Please choose another.'
      );
    }

    throw new Error(error.message);
  }

  // Delete the old file after the profile update succeeds.
  if (!avatarPath && existing.avatar_url) {
    const { error: removeError } = await supabase.storage
      .from('avatars')
      .remove([existing.avatar_url]);

    if (removeError) {
      console.warn('Old avatar cleanup failed:', removeError.message);
    }
  }

  // Only the accent preference remains local.
  try {
    localStorage.setItem(
      'echoes-profile-v1',
      JSON.stringify({
        theme: updatedProfile.theme
      })
    );
  } catch {
    console.warn('Could not save appearance preference.');
  }

  profile = {
    ...updatedProfile,
    avatar
  };
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
async function saveDiary() {
        if (!draft.name.trim()) return;

if (editing) {
    const userId = session?.user?.id;
    const existingDiary = diaries.find((d) => d.id === editing);

    if (!userId || !existingDiary) {
        error = "Please sign in and select a diary.";
        return;
    }

    let cloudId = existingDiary.cloudId;

    if (!cloudId) {
        const { data, error: lookupError } = await supabase
            .from("diaries")
            .select("id")
            .eq("owner_id", userId)
            .eq("legacy_id", String(existingDiary.id))
            .maybeSingle();

        if (lookupError || !data) {
            error = lookupError?.message || "Cloud diary not found.";
            return;
        }

        cloudId = data.id;
    }

    const { data: updated, error: updateError } = await supabase
        .from("diaries")
        .update({
            name: draft.name.trim(),
            description: draft.description || "",
            kind: draft.kind === "Personal" ? "personal" : "shared",
            accent: draft.accent,
            cover: draft.cover || null,
            background: draft.background || null
        })
        .eq("id", cloudId)
        .eq("owner_id", userId)
        .select("id")
        .single();

    if (updateError) {
        console.error("[Echoes Cloud] Diary update failed:", updateError);
        error = "Could not update diary: " + updateError.message;
        return;
    }

    diaries = diaries.map((d) =>
        d.id === editing
            ? {
                ...d,
                ...draft,
                cloudId: updated.id,
                name: draft.name.trim()
              }
            : d
    );
} else {


const userId = session?.user?.id;

if (!userId) {
    error = "Please sign in before creating a diary.";
    return;
}

const diaryId = newId();
const diaryName = draft.name.trim();

const { data: cloudDiary, error: cloudError } = await supabase
    .from("diaries")
    .insert({
        owner_id: userId,
        legacy_id: String(diaryId),
        name: diaryName,
        description: draft.description || "",
        kind: draft.kind === "Personal" ? "personal" : "shared",
        accent: draft.accent,
        cover: draft.cover || null,
        background: draft.background || null
    })
    .select("id")
    .single();

if (cloudError) {
    console.error("[Echoes Cloud] Diary creation failed:", cloudError);
    error = "Could not create diary: " + cloudError.message;
    return;
}

const d = {
    ...draft,
    id: diaryId,
    cloudId: cloudDiary.id,
    name: diaryName,
    members: ["You"],
    entries: [],
    milestones: []
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


async function deleteEntry(entryId) {
    const userId = session?.user?.id;
    const diary = diaries.find((d) => d.id === selected);
    const existingEntry = diary?.entries.find(
        (e) => e.id === entryId
    );

    if (!userId || !diary || !existingEntry) {
        alert("Could not find this memory.");
        return;
    }

    if (existingEntry.author !== "You") {
        alert("You can only delete your own memories.");
        return;
    }

    if (!confirm(`Permanently delete "${existingEntry.title}"?`)) {
        return;
    }

    try {
        let cloudDiaryId = diary.cloudId;

        if (!cloudDiaryId) {
            const { data, error: diaryError } = await supabase
                .from("diaries")
                .select("id")
                .eq("owner_id", userId)
                .eq("legacy_id", String(diary.id))
                .single();

            if (diaryError) throw diaryError;
            cloudDiaryId = data.id;
        }

        let cloudEntryId = existingEntry.cloudId;

        if (!cloudEntryId) {
            const { data, error: lookupError } = await supabase
                .from("diary_entries")
                .select("id")
                .eq("diary_id", cloudDiaryId)
                .eq("author_id", userId)
                .eq("legacy_id", String(existingEntry.id))
                .single();

            if (lookupError) throw lookupError;
            cloudEntryId = data.id;
        }

        const { data: deleted, error: deleteError } = await supabase
            .from("diary_entries")
            .delete()
            .eq("id", cloudEntryId)
            .eq("diary_id", cloudDiaryId)
            .eq("author_id", userId)
            .select("id")
            .single();

        if (deleteError) throw deleteError;
        if (!deleted) throw new Error("Memory was not deleted.");

        // Update the interface only after cloud deletion succeeds.
        diaries = diaries.map((d) =>
            d.id === diary.id
                ? {
                    ...d,
                    entries: d.entries.filter(
                        (e) => e.id !== entryId
                    )
                }
                : d
        );

        console.log("[Echoes Cloud] Memory deleted:", entryId);

    } catch (err) {
        console.error("[Echoes Cloud] Memory deletion failed:", err);
        alert("Could not delete memory: " + err.message);
    }
}


async function saveEntry() {
        if (!entry.title.trim() || !entry.body.trim()) return;


if (editingEntryId) {
    const userId = session?.user?.id;
    const diary = diaries.find((d) => d.id === selected);
    const original = diary?.entries.find(
        (e) => e.id === editingEntryId
    );

    if (!userId || !diary || !original || original.author !== "You") {
        alert("Could not find this memory or its owner.");
        return;
    }

    try {
        let cloudDiaryId = diary.cloudId;

        if (!cloudDiaryId) {
            const { data, error: lookupError } = await supabase
                .from("diaries")
                .select("id")
                .eq("owner_id", userId)
                .eq("legacy_id", String(diary.id))
                .single();

            if (lookupError) throw lookupError;
            cloudDiaryId = data.id;
        }

        let cloudEntryId = original.cloudId;

        if (!cloudEntryId) {
            const { data, error: lookupError } = await supabase
                .from("diary_entries")
                .select("id")
                .eq("diary_id", cloudDiaryId)
                .eq("author_id", userId)
                .eq("legacy_id", String(original.id))
                .single();

            if (lookupError) throw lookupError;
            cloudEntryId = data.id;
        }

        const { data: stored, error: readError } = await supabase
            .from("diary_entries")
            .select("photos, audio")
            .eq("id", cloudEntryId)
            .eq("author_id", userId)
            .single();

        if (readError) throw readError;

        const originalPhotos = original.photos ?? [];
        const storedPhotos = stored.photos ?? [];
        const updatedPhotoPaths = [];

        for (const photo of entry.photos ?? []) {
            const oldIndex = originalPhotos.indexOf(photo);

            if (oldIndex !== -1 && storedPhotos[oldIndex]) {
                updatedPhotoPaths.push(storedPhotos[oldIndex]);
            } else {
                const path = await uploadDiaryMedia(
                    userId,
                    cloudDiaryId,
                    photo
                );
                updatedPhotoPaths.push(path);
            }
        }

        let updatedAudioPath = null;

        if (entry.audio) {
            if (entry.audio === original.audio && stored.audio) {
                updatedAudioPath = stored.audio;
            } else {
                updatedAudioPath = await uploadDiaryMedia(
                    userId,
                    cloudDiaryId,
                    entry.audio
                );
            }
        }

        const { data: updated, error: updateError } = await supabase
            .from("diary_entries")
            .update({
                title: entry.title.trim(),
                body: entry.body.trim(),
                type: entry.type,
                visibility: entry.visibility,
                photos: updatedPhotoPaths,
                audio: updatedAudioPath
            })
            .eq("id", cloudEntryId)
            .eq("author_id", userId)
            .select("id")
            .single();

        if (updateError) throw updateError;

        diaries = diaries.map((d) =>
            d.id === selected
                ? {
                    ...d,
                    entries: d.entries.map((e) =>
                        e.id === editingEntryId
                            ? {
                                ...e,
                                cloudId: updated.id,
                                title: entry.title.trim(),
                                body: entry.body.trim(),
                                type: entry.type,
                                visibility: entry.visibility,
                                photos: [...(entry.photos ?? [])],
                                audio: entry.audio ?? null
                            }
                            : e
                    )
                }
                : d
        );

    } catch (err) {
        console.error("[Echoes Cloud] Memory update failed:", err);
        alert("Could not update memory: " + err.message);
        return;
    }

} else {

            const userId = session?.user?.id;
            const diary = diaries.find((d) => d.id === selected);

            if (!userId || !diary) {
                alert("Please sign in and select a diary.");
                return;
            }

            // Resolve the Supabase diary UUID.
            let cloudDiaryId = diary.cloudId;

            if (!cloudDiaryId) {
                const { data, error: lookupError } = await supabase
                    .from("diaries")
                    .select("id")
                    .eq("owner_id", userId)
                    .eq("legacy_id", String(diary.id))
                    .maybeSingle();

                if (lookupError || !data) {
                    alert(
                        "Could not find the diary in Supabase: " +
                        (lookupError?.message || diary.name)
                    );
                    return;
                }

                cloudDiaryId = data.id;
            }



let uploadedPhotoPaths = [];

try {
    for (const photo of entry.photos ?? []) {
        const path = await uploadDiaryMedia(
            userId,
            cloudDiaryId,
            photo
        );

        uploadedPhotoPaths.push(path);
    }
} catch (uploadError) {
    console.error(
        "[Echoes Cloud] Photo upload failed:",
        uploadError
    );

    alert(
        "Could not upload photos: " + uploadError.message
    );
    return;
}


let uploadedAudioPath = null;

if (entry.audio) {
    try {
        uploadedAudioPath = await uploadDiaryMedia(
            userId,
            cloudDiaryId,
            entry.audio
        );
    } catch (uploadError) {
        console.error(
            "[Echoes Cloud] Audio upload failed:",
            uploadError
        );

        alert(
            "Could not upload voice recording: " +
            uploadError.message
        );
        return;
    }
}



            const memoryId = newId();
            const memoryDate = new Date().toLocaleDateString("en-CA");

            const { data: cloudMemory, error: cloudError } = await supabase
                .from("diary_entries")
                .insert({
                    diary_id: cloudDiaryId,
                    author_id: userId,
                    legacy_id: String(memoryId),
                    title: entry.title.trim(),
                    body: entry.body.trim(),
                    type: entry.type,
                    visibility: entry.visibility,
                    entry_date: `${memoryDate}T12:00:00Z`,
photos: uploadedPhotoPaths,
audio: uploadedAudioPath,
                    liked_by_you: false,
                    comments: []
                })
                .select("id")
                .single();

            if (cloudError) {
                console.error(
                    "[Echoes Cloud] Memory creation failed:",
                    cloudError
                );
                alert("Could not save memory: " + cloudError.message);
                return;
            }

const newEntry = {
    ...entry,
    id: memoryId,
    cloudId: cloudMemory.id,
    author: "You",
    date: memoryDate,
photos: [...(entry.photos ?? [])],
audio: entry.audio || null,
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


async function removeDiary() {
    const userId = session?.user?.id;
    const diary = diaries.find((d) => d.id === selected);

    if (!userId || !diary) {
        error = "Please sign in and select a diary.";
        return;
    }

    if (
        !confirm(
            `Permanently delete "${diary.name}" and all its memories? ` +
            "This will delete its database records and cannot be undone."
        )
    ) return;

    try {
        let cloudId = diary.cloudId;

        if (!cloudId) {
            const { data, error: lookupError } = await supabase
                .from("diaries")
                .select("id")
                .eq("owner_id", userId)
                .eq("legacy_id", String(diary.id))
                .maybeSingle();

            if (lookupError) throw lookupError;
            if (!data) throw new Error("Cloud diary not found.");

            cloudId = data.id;
        }

        // Remove child records before deleting their parent diary.
        const { error: entriesError } = await supabase
            .from("diary_entries")
            .delete()
            .eq("diary_id", cloudId);

        if (entriesError) throw entriesError;

        const { error: milestonesError } = await supabase
            .from("diary_milestones")
            .delete()
            .eq("diary_id", cloudId);

        if (milestonesError) throw milestonesError;

        const { data: deleted, error: deleteError } = await supabase
            .from("diaries")
            .delete()
            .eq("id", cloudId)
            .eq("owner_id", userId)
            .select("id")
            .single();

        if (deleteError) throw deleteError;
        if (!deleted) throw new Error("Diary was not deleted.");

        diaries = diaries.filter((d) => d.id !== diary.id);
        selected = null;
        modal = "";

        console.log("[Echoes Cloud] Diary deleted:", diary.name);
    } catch (err) {
        console.error("[Echoes Cloud] Diary deletion failed:", err);
        error = "Could not delete diary: " + err.message;
        alert(error);
    }
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


{#if authLoading}
  <div class="min-h-screen flex items-center justify-center bg-[#101113]">
    <p class="text-sm text-[#bcb4b5]">Opening Echoes...</p>
  </div>
{:else if !session}
  <AuthScreen />
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
  <div class="flex justify-end mb-5">
    <button
      type="button"
      onclick={signOut}
      class="flex items-center gap-2 text-xs text-[#bcb4b5] hover:text-white transition-colors"
    >
      <LogOut size={15} />
      Sign out
    </button>
  </div>
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
