<script>
    import { supabase } from "$lib/supabase";
    import { uploadDiaryMedia, getDiaryMediaUrl } from "$lib/diaryCloud";

    import Sidebar from "$lib/components/Sidebar.svelte";
    import AppSidebar from "$lib/components/AppSidebar.svelte";
    import AccountSettings from "$lib/components/AccountSettings.svelte";
    import AuthScreen from "$lib/components/AuthScreen.svelte";
    import DiaryLibrary from "$lib/components/DiaryLibrary.svelte";
    import DiaryView from "$lib/components/DiaryView.svelte";
    import EntryEditor from "$lib/components/EntryEditor.svelte";
    import DiarySettings from "$lib/components/DiarySettings.svelte";
    import UserProfile from "$lib/components/UserProfile.svelte";
    import AppAppearance from "$lib/components/AppAppearance.svelte";
import DiaryShareModal from "$lib/components/DiaryShareModal.svelte";


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
    let cloudLoadVersion = 0;
    let authLoading = $state(true);
    let session = $state(null);

    onMount(() => {
        let active = true;
        let lastUserId = session?.user?.id ?? null;
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            if (!active) return;

            const nextUserId = newSession?.user?.id ?? null;

            if (nextUserId !== lastUserId) {
                cloudLoadVersion++;
                diaries = [];
                selected = null;
                cloudReady = false;

                profileOpen = false;
                appearanceOpen = false;
                modal = "";
                editing = null;

                profile = {
                    ...profile,
                    displayName: "",
                    username: "",
                    bio: "",
                    avatar: "",
                };

                lastUserId = nextUserId;
            }

            session = newSession;
            authLoading = false;

            if (!newSession?.user?.id) {
                cloudLoadVersion++;
                diaries = [];
                selected = null;
                cloudReady = false;
            }


if (newSession?.user?.id) {
    const pendingInvite = sessionStorage.getItem("pendingDiaryInvite");

    if (pendingInvite) {
        sessionStorage.removeItem("pendingDiaryInvite");

        window.location.replace(
            `/join?token=${encodeURIComponent(pendingInvite)}`
        );

        return;
    }

    loadSupabaseProfile(newSession.user.id);
    loadCloudDiaries(newSession.user.id);
}

        });

        supabase.auth
            .getSession()
            .then(({ data, error }) => {
                if (!active) return;

                if (error) {
                    console.error("Could not restore session:", error.message);
                } else {
                    session = data.session;
                }

                authLoading = false;
            })
            .catch((error) => {
                if (!active) return;
                console.error("Session check failed:", error);
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
            console.error("Sign out failed:", error.message);
            alert("Could not sign out. Please try again.");
            return;
        }

        selected = null;
        profileOpen = false;
        appearanceOpen = false;
        modal = "";
    }
    let diaries = $state([]),
        selected = $state(null),
        tab = $state("shared"),
        modal = $state(""),
        editing = $state(null);
        let shareInviteUrl = $state("");
        
let joinedDiaryWelcome = $state(false);
let diaryMembers = $state([]);
let showDiaryMembers = $state(false);

let memberPreview = $derived.by(() => {
    const ordered = [...diaryMembers].sort(
        (a, b) =>
            Number(b.user_id === session?.user?.id) -
            Number(a.user_id === session?.user?.id)
    );

    const names = ordered.slice(0, 3).map((member) =>
        member.user_id === session?.user?.id
            ? "You"
            : member.display_name || member.username || "Unknown"
    );

    const remaining = Math.max(ordered.length - 3, 0);

    return remaining
        ? `${names.join(", ")}, +${remaining} more`
        : names.join(", ");
});

async function loadDiaryMembers(diaryId) {
    diaryMembers = [];

    if (!diaryId) return;

    const { data, error } = await supabase.rpc(
        "get_diary_participants",
        { p_diary_id: diaryId }
    );

    if (error) {
        console.error("Could not load diary members:", error);
        return;
    }

diaryMembers = await Promise.all(
    (data ?? []).map(async (member) => {
        if (!member.avatar_url) return member;

        const { data: avatarData, error: avatarError } =
            await supabase.storage
                .from("avatars")
                .createSignedUrl(member.avatar_url, 60 * 60);

        if (avatarError) {
            console.error(
                `Could not load avatar for @${member.username}:`,
                avatarError
            );
        }

        return {
            ...member,
            avatar_url: avatarData?.signedUrl || null
        };
    })
);
    console.table(
    diaryMembers.map(member => ({
        username: member.username,
        avatar_url: member.avatar_url,
        avatar_type: member.avatar_url?.startsWith("http")
            ? "Full URL"
            : "Storage path or empty"
    }))
);
    console.table($state.snapshot(diaryMembers));
}

let showShareModal = $state(false);
    let draft = $state({
        name: "",
        kind: "Couple",

        customKind: "",

        privacy: "shared",
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
    let accountSettingsOpen = $state(false);
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
            .from("avatars")
            .upload(path, blob, {
                contentType: "image/webp",
                upsert: true,
                cacheControl: "0",
            });

        if (error) throw new Error(error.message);

        return path;
    }

    async function getAvatarSignedUrl(path) {
        if (!path) return "";

        const { data, error } = await supabase.storage
            .from("avatars")
            .createSignedUrl(path, 60 * 60);

        if (error) {
            console.error("Could not load avatar:", error.message);
            return "";
        }

        return data.signedUrl;
    }

    async function resolveCloudMedia(diary) {
        const entries = await Promise.all(
            diary.entries.map(async (entry) => {
                const photos = await Promise.all(
                    (entry.photos ?? []).map(async (path) => {
                        try {
                            return await getDiaryMediaUrl(path);
                        } catch (error) {
                            console.error("Could not load photo:", error);
                            return "";
                        }
                    }),
                );

                let audio = null;

                if (entry.audio) {
                    try {
                        audio = await getDiaryMediaUrl(entry.audio);
                    } catch (error) {
                        console.error("Could not load audio:", error);
                    }
                }

                return {
                    ...entry,
                    photos: photos.filter(Boolean),
                    audio,
                };
            }),
        );

        return {
            ...diary,
            entries,
        };
    }

    function formatCloudDiary(diary, entries = [], milestones = []) {
        return {
            id: diary.legacy_id || diary.id,
            cloudId: diary.id,
            ownerId: diary.owner_id,
            privacy: diary.kind,
            name: diary.name,
            description: diary.description || "",

            kind:
                diary.display_kind ||
                (diary.kind === "personal" ? "Personal" : "Couple"),

            accent: diary.accent || "#dca9a6",
            cover: diary.cover || "",
            background: diary.background || "",
            members: [],

            entries: entries.map((memory) => ({
                id: memory.legacy_id || memory.id,
                cloudId: memory.id,
                title: memory.title || "",
                body: memory.body || "",
                type: memory.type || "shared",
                visibility: memory.visibility || "shared",
                authorId: memory.author_id,
                
author: memory.author_id,
                date: memory.entry_date?.slice(0, 10) || "",
                photos: memory.photos || [],
                audio: memory.audio || null,
likedByYou: false,
likeCount: 0,
comments: memory.comments || [],
            })),

            milestones: milestones.map((milestone) => ({
                id: milestone.legacy_id || milestone.id,
                cloudId: milestone.id,
                title: milestone.title || "",
                date: milestone.milestone_date || "",
                category: milestone.category || "",
                notes: milestone.notes || "",
                recurring: milestone.recurrence === "yearly",
            })),
        };
    }

    async function promptDiaryInvitation(diary) {
        if (!diary?.cloudId) {
            alert("Please wait for this diary to finish syncing.");
            return;
        }

        try {
            const { data: token, error } = await supabase.rpc(
                "get_diary_qr_invite",
                { p_diary_id: diary.cloudId },
            );

            if (error) throw error;

            const inviteUrl = `${window.location.origin}/join?token=${encodeURIComponent(token)}`;

shareInviteUrl = inviteUrl;
showShareModal = true;
        } catch (error) {
            console.error("Could not create diary invitation:", error);
            alert(error.message || "Could not create diary invitation.");
        }
    }

    async function loadCloudDiaries(userId) {
        const loadVersion = ++cloudLoadVersion;
        const { data: cloudDiaries, error: diaryError } = await supabase
            .from("diaries")
            .select("*")

            .order("created_at", { ascending: false });

        if (diaryError) {
            console.error("[Echoes Cloud] Could not load diaries:", diaryError);
            return;
        }

        const formattedDiaries = [];

        for (const diary of cloudDiaries ?? []) {
            const { data: entries, error: entryError } = await supabase
                .from("diary_entries")
                .select("*")
                .eq("diary_id", diary.id)
                .order("created_at", { ascending: false });

            if (entryError) {
                console.error(
                    "[Echoes Cloud] Could not load memories:",
                    entryError,
                );
                return;
            }

            const { data: milestones, error: milestoneError } = await supabase
                .from("diary_milestones")
                .select("*")
                .eq("diary_id", diary.id);

            if (milestoneError) {
                console.error(
                    "[Echoes Cloud] Could not load milestones:",
                    milestoneError,
                );
                return;
            }

            const formattedDiary = formatCloudDiary(diary, entries, milestones);
            const entryIds = (entries ?? []).map((entry) => entry.id);

if (entryIds.length > 0) {
    const { data: likes, error: likesError } = await supabase
        .from("diary_entry_likes")
        .select("entry_id, user_id")
        .in("entry_id", entryIds);

    if (likesError) {
        console.error("[Echoes Cloud] Could not load likes:", likesError);
    } else {
        formattedDiary.entries = formattedDiary.entries.map((entry) => {
            const entryLikes = (likes ?? []).filter(
                (like) => like.entry_id === entry.cloudId
            );

            return {
                ...entry,
                likedByYou: entryLikes.some(
                    (like) => like.user_id === userId
                ),
                likeCount: entryLikes.length,
            };
        });
    }
}
            if (diary.kind === "shared") {
    const { data: participants, error: participantsError } =
        await supabase.rpc("get_diary_participants", {
            p_diary_id: diary.id
        });

    if (participantsError) {
        console.error("Could not load dashboard members:", participantsError);
    } else {
        formattedDiary.members = (participants ?? []).map((member) =>
            member.user_id === userId
                ? "You"
                : member.display_name || member.username || "Unknown"
        );
    }
} else {
    formattedDiary.members = ["You"];
}

            const diaryWithMedia = await resolveCloudMedia(formattedDiary);

            formattedDiaries.push(diaryWithMedia);
        }

        if (loadVersion !== cloudLoadVersion || session?.user?.id !== userId)
            return;

diaries = formattedDiaries;

const joinedDiaryId = sessionStorage.getItem("joinedDiaryId");

if (joinedDiaryId) {
    const joinedDiary = formattedDiaries.find(
        (diary) => diary.cloudId === joinedDiaryId
    );

    selected = joinedDiary?.id ?? null;


if (joinedDiary) {
    sessionStorage.removeItem("joinedDiaryId");
    joinedDiaryWelcome = true;
}

} else {
    selected = null;
}

cloudReady = true;


        console.log(
            "[Echoes Cloud] Loaded diaries into interface:",
            formattedDiaries.length,
        );
    }

    async function loadSupabaseProfile(userId) {
        const { data, error } = await supabase
            .from("profiles")
            .select("username, display_name, bio, avatar_url")
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            console.error("Could not load profile:", error.message);
            return;
        }

        const avatar = data?.avatar_url
            ? await getAvatarSignedUrl(data.avatar_url)
            : "";

        if (session?.user?.id !== userId) return;

        profile = {
            ...profile,
            displayName: data?.display_name ?? "",
            username: data?.username ?? "",
            bio: data?.bio ?? "",
            avatar,
        };
    }

    let cloudReady = $state(false);
    let ready = $state(false);
    let error = $state("");

    onMount(() => {
        try {
            const savedProfile = localStorage.getItem("echoes-profile-v1");

            if (savedProfile) {
                const localProfile = JSON.parse(savedProfile);

                profile = {
                    ...profile,
                    theme: localProfile.theme ?? "rose",
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
            throw new Error("Please sign in to save your profile.");
        }

        // Read the currently saved avatar path.
        const { data: existing, error: readError } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", userId)
            .single();

        if (readError) throw new Error(readError.message);

        let avatarPath = existing.avatar_url;
        let avatar = updatedProfile.avatar;

        // New image selected in the editor.
        if (avatar?.startsWith("data:image/")) {
            avatarPath = await uploadProfileAvatar(userId, avatar);
            avatar = await getAvatarSignedUrl(avatarPath);

            if (!avatar) {
                throw new Error("Avatar uploaded but could not be displayed.");
            }
        } else if (!avatar) {
            // User clicked Remove profile photo.
            avatarPath = null;
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                username: updatedProfile.username,
                display_name: updatedProfile.displayName,
                bio: updatedProfile.bio,
                avatar_url: avatarPath,
            })
            .eq("id", userId);

        if (error) {
            if (error.code === "23505") {
                throw new Error(
                    "This username is already taken. Please choose another.",
                );
            }

            throw new Error(error.message);
        }

        // Delete the old file after the profile update succeeds.
        if (!avatarPath && existing.avatar_url) {
            const { error: removeError } = await supabase.storage
                .from("avatars")
                .remove([existing.avatar_url]);

            if (removeError) {
                console.warn("Old avatar cleanup failed:", removeError.message);
            }
        }

        // Only the accent preference remains local.
        try {
            localStorage.setItem(
                "echoes-profile-v1",
                JSON.stringify({
                    theme: updatedProfile.theme,
                }),
            );
        } catch {
            console.warn("Could not save appearance preference.");
        }

        profile = {
            ...updatedProfile,
            avatar,
        };
    }

    function openCreate() {
        draft = {
            name: "",
            kind: "Couple",
            customKind: "",
            privacy: "shared",
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
            privacy:
                current.privacy ??
                (current.kind === "Personal" ? "personal" : "shared"),

            kind: [
                "Couple",
                "Best Friends",
                "Family",
                "Personal",
                "Other",
            ].includes(current.kind)
                ? current.kind
                : "Other",
            customKind: [
                "Couple",
                "Best Friends",
                "Family",
                "Personal",
                "Other",
            ].includes(current.kind)
                ? ""
                : current.kind,

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

        const diaryType =
            draft.kind === "Other" ? draft.customKind?.trim() : draft.kind;

        if (!diaryType) {
            error = "Please enter your custom diary type.";
            return;
        }

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
                    kind: draft.privacy,
                    display_kind: diaryType,
                    accent: draft.accent,
                    cover: draft.cover || null,
                    background: draft.background || null,
                })
                .eq("id", cloudId)
                .eq("owner_id", userId)
                .select("id")
                .single();

            if (updateError) {
                console.error(
                    "[Echoes Cloud] Diary update failed:",
                    updateError,
                );
                error = "Could not update diary: " + updateError.message;
                return;
            }

            diaries = diaries.map((d) =>
                d.id === editing
                    ? {
                          ...d,
                          ...draft,
                          kind: diaryType,
                          cloudId: updated.id,
                          name: draft.name.trim(),
                      }
                    : d,
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
                    kind: draft.privacy,
                    display_kind: diaryType,
                    accent: draft.accent,
                    cover: draft.cover || null,
                    background: draft.background || null,
                })
                .select("id")
                .single();

            if (cloudError) {
                console.error(
                    "[Echoes Cloud] Diary creation failed:",
                    cloudError,
                );
                error = "Could not create diary: " + cloudError.message;
                return;
            }

            const d = {
                ...draft,
                kind: diaryType,
                id: diaryId,
                cloudId: cloudDiary.id,
                ownerId: userId,
                name: diaryName,
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
        if (existingEntry.author !== session?.user?.id) return;

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
        const existingEntry = diary?.entries.find((e) => e.id === entryId);

        if (!userId || !diary || !existingEntry) {
            alert("Could not find this memory.");
            return;
        }

        if (existingEntry.authorId !== userId) {
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
                          entries: d.entries.filter((e) => e.id !== entryId),
                      }
                    : d,
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
                (e) => e.id === editingEntryId,
            );

            if (
                !userId ||
                !diary ||
                !original ||
                original.authorId !== userId
            ) {
                alert("Could not find this memory or its owner.");
                return;
            }

            try {
                let cloudDiaryId = diary.cloudId;

                if (!cloudDiaryId) {
                    const { data, error: lookupError } = await supabase
                        .from("diaries")
                        .select("id")
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
                            photo,
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
                            entry.audio,
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
                        audio: updatedAudioPath,
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
                                            audio: entry.audio ?? null,
                                        }
                                      : e,
                              ),
                          }
                        : d,
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
                    .eq("legacy_id", String(diary.id))
                    .maybeSingle();

                if (lookupError || !data) {
                    alert(
                        "Could not find the diary in Supabase: " +
                            (lookupError?.message || diary.name),
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
                        photo,
                    );

                    uploadedPhotoPaths.push(path);
                }
            } catch (uploadError) {
                console.error(
                    "[Echoes Cloud] Photo upload failed:",
                    uploadError,
                );

                alert("Could not upload photos: " + uploadError.message);
                return;
            }

            let uploadedAudioPath = null;

            if (entry.audio) {
                try {
                    uploadedAudioPath = await uploadDiaryMedia(
                        userId,
                        cloudDiaryId,
                        entry.audio,
                    );
                } catch (uploadError) {
                    console.error(
                        "[Echoes Cloud] Audio upload failed:",
                        uploadError,
                    );

                    alert(
                        "Could not upload voice recording: " +
                            uploadError.message,
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
                    comments: [],
                })
                .select("id")
                .single();

            if (cloudError) {
                console.error(
                    "[Echoes Cloud] Memory creation failed:",
                    cloudError,
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

    async function toggleReaction(entryId) {
        const userId = session?.user?.id;
        const diary = current;

        if (!userId || !diary) return;

        const entry = (diary.entries ?? []).find((e) => e.id === entryId);

        if (
            !entry ||
            (entry.type !== "shared" && entry.visibility !== "shared")
        )
            return;

        const newLikedState = !entry.likedByYou;

        try {
            let cloudEntryId = entry.cloudId;

            if (!cloudEntryId) {
                const { data, error } = await supabase
                    .from("diary_entries")
                    .select("id")
                    .eq("diary_id", diary.cloudId)
                    .eq("legacy_id", String(entry.id))
                    .single();

                if (error) throw error;
                cloudEntryId = data.id;
            }

let reactionError;

if (newLikedState) {
    const { error } = await supabase
        .from("diary_entry_likes")
        .insert({
            entry_id: cloudEntryId,
            user_id: userId,
        });

    reactionError = error;
} else {
    const { error } = await supabase
        .from("diary_entry_likes")
        .delete()
        .eq("entry_id", cloudEntryId)
        .eq("user_id", userId);

    reactionError = error;
}

if (reactionError) throw reactionError;

            if (session?.user?.id !== userId) return;

            diaries = diaries.map((d) =>
                d.id === diary.id
                    ? {
                          ...d,
                          entries: d.entries.map((e) =>
                              e.id === entryId
                                  ? {
                                        ...e,
                                        likedByYou: newLikedState,
likeCount: Math.max(
    0,
    (e.likeCount ?? 0) + (newLikedState ? 1 : -1)
),
                                    }
                                  : e,
                          ),
                      }
                    : d,
            );
        } catch (error) {
            console.error("[Echoes Cloud] Could not update reaction:", error);

            alert("Could not save reaction: " + error.message);
        }
    }

    async function addComment(entryId, text) {
        const cleaned = text?.trim();
        const userId = session?.user?.id;
        const diary = current;

        if (!cleaned || !userId || !diary) return;

        const entry = (diary.entries ?? []).find((e) => e.id === entryId);

        if (
            !entry ||
            (entry.type !== "shared" && entry.visibility !== "shared")
        )
            return;

        const comment = {
            id: newId(),
            author: "You",
            authorId: userId,
            text: cleaned,
            createdAt: new Date().toISOString(),
        };

        try {
            let cloudDiaryId = diary.cloudId;

            if (!cloudDiaryId) {
                const { data, error } = await supabase
                    .from("diaries")
                    .select("id")

                    .eq("legacy_id", String(diary.id))
                    .single();

                if (error) throw error;
                cloudDiaryId = data.id;
            }

            let cloudEntryId = entry.cloudId;

            if (!cloudEntryId) {
                const { data, error } = await supabase
                    .from("diary_entries")
                    .select("id")
                    .eq("diary_id", cloudDiaryId)
                    .eq("legacy_id", String(entry.id))
                    .single();

                if (error) throw error;
                cloudEntryId = data.id;
            }

const { error } = await supabase.rpc("add_diary_comment", {
    p_entry_id: cloudEntryId,
    p_comment: comment,
});

if (error) throw error;

const { data: latest, error: fetchError } = await supabase
    .from("diary_entries")
    .select("comments")
    .eq("id", cloudEntryId)
    .eq("diary_id", cloudDiaryId)
    .single();

if (fetchError) throw fetchError;

const updatedComments = latest.comments ?? [];

            if (session?.user?.id !== userId) return;

            diaries = diaries.map((d) =>
                d.id === diary.id
                    ? {
                          ...d,
                          entries: d.entries.map((e) =>
                              e.id === entryId
                                  ? {
                                        ...e,
                                        comments: updatedComments,
                                    }
                                  : e,
                          ),
                      }
                    : d,
            );
        } catch (error) {
            console.error("[Echoes Cloud] Could not add comment:", error);

            alert("Could not save comment: " + error.message);
        }
    }

    async function deleteComment(entryId, commentId) {
        const userId = session?.user?.id;
        const diary = current;

        if (!userId || !diary) return;

        const entry = (diary.entries ?? []).find((e) => e.id === entryId);

        if (!entry) return;

        try {
            let cloudDiaryId = diary.cloudId;

            if (!cloudDiaryId) {
                const { data, error } = await supabase
                    .from("diaries")
                    .select("id")

                    .eq("legacy_id", String(diary.id))
                    .single();

                if (error) throw error;
                cloudDiaryId = data.id;
            }

            let cloudEntryId = entry.cloudId;

            if (!cloudEntryId) {
                const { data, error } = await supabase
                    .from("diary_entries")
                    .select("id")
                    .eq("diary_id", cloudDiaryId)
                    .eq("legacy_id", String(entry.id))
                    .single();

                if (error) throw error;
                cloudEntryId = data.id;
            }

            const { data: latest, error: fetchError } = await supabase
                .from("diary_entries")
                .select("comments")
                .eq("id", cloudEntryId)
                .eq("diary_id", cloudDiaryId)
                .single();

            if (fetchError) throw fetchError;

            const updatedComments = (latest.comments ?? []).filter(
                (c) => c.id !== commentId,
            );

            const { error } = await supabase
                .from("diary_entries")
                .update({ comments: updatedComments })
                .eq("id", cloudEntryId)
                .eq("diary_id", cloudDiaryId);

            if (error) throw error;

            if (session?.user?.id !== userId) return;

            diaries = diaries.map((d) =>
                d.id === diary.id
                    ? {
                          ...d,
                          entries: d.entries.map((e) =>
                              e.id === entryId
                                  ? {
                                        ...e,
                                        comments: updatedComments,
                                    }
                                  : e,
                          ),
                      }
                    : d,
            );
        } catch (error) {
            console.error("[Echoes Cloud] Could not delete comment:", error);

            alert("Could not delete comment: " + error.message);
        }
    }

    async function saveMilestone(milestone) {
        const userId = session?.user?.id;
        const diary = current;

        if (!userId || !diary || !milestone.title?.trim() || !milestone.date) {
            return;
        }

        try {
            let cloudDiaryId = diary.cloudId;

            if (!cloudDiaryId) {
                const { data, error } = await supabase
                    .from("diaries")
                    .select("id")

                    .eq("legacy_id", String(diary.id))
                    .single();

                if (error) throw error;
                cloudDiaryId = data.id;
            }

            const original = milestone.id
                ? (diary.milestones ?? []).find((m) => m.id === milestone.id)
                : null;

                if (!original && (diary.milestones ?? []).length >= 1) {
    alert("This diary already has a milestone. You can edit the existing milestone instead.");
    return;
}

            const savedId = milestone.id ?? newId();

            const payload = {
                title: milestone.title.trim(),
                milestone_date: milestone.date,
                category: milestone.category || "",
                notes: milestone.notes || "",
                recurrence: milestone.recurring ? "yearly" : "none",
            };

            let stored;

            if (original) {
                let cloudMilestoneId = original.cloudId;

                if (!cloudMilestoneId) {
                    const { data, error } = await supabase
                        .from("diary_milestones")
                        .select("id")
                        .eq("diary_id", cloudDiaryId)
                        .eq("legacy_id", String(original.id))
                        .single();

                    if (error) throw error;
                    cloudMilestoneId = data.id;
                }

                const { data, error } = await supabase
                    .from("diary_milestones")
                    .update(payload)
                    .eq("id", cloudMilestoneId)
                    .eq("diary_id", cloudDiaryId)
                    .select()
                    .single();

                if (error) throw error;
                stored = data;
            } else {
                const { data, error } = await supabase
                    .from("diary_milestones")
                    .insert({
                        ...payload,
                        diary_id: cloudDiaryId,
                        legacy_id: String(savedId),
                    })
                    .select()
                    .single();

                if (error) throw error;
                stored = data;
            }

            if (session?.user?.id !== userId) return;

            const saved = {
                ...milestone,
                id: savedId,
                cloudId: stored.id,
            };

            diaries = diaries.map((d) => {
                if (d.id !== diary.id) return d;

                const existing = d.milestones ?? [];

                return {
                    ...d,
                    milestones: original
                        ? existing.map((m) =>
                              m.id === original.id ? saved : m,
                          )
                        : [...existing, saved],
                };
            });
        } catch (error) {
            console.error("[Echoes Cloud] Milestone save failed:", error);
            alert("Could not save milestone: " + error.message);
        }
    }

    async function deleteMilestone(id) {
        const userId = session?.user?.id;
        const diary = current;

        if (!userId || !diary) return;

        const milestone = (diary.milestones ?? []).find((m) => m.id === id);

        if (!milestone) return;

        try {
            let cloudDiaryId = diary.cloudId;

            if (!cloudDiaryId) {
                const { data, error } = await supabase
                    .from("diaries")
                    .select("id")

                    .eq("legacy_id", String(diary.id))
                    .single();

                if (error) throw error;
                cloudDiaryId = data.id;
            }

            let cloudMilestoneId = milestone.cloudId;

            if (!cloudMilestoneId) {
                const { data, error } = await supabase
                    .from("diary_milestones")
                    .select("id")
                    .eq("diary_id", cloudDiaryId)
                    .eq("legacy_id", String(milestone.id))
                    .single();

                if (error) throw error;
                cloudMilestoneId = data.id;
            }

            const { error } = await supabase
                .from("diary_milestones")
                .delete()
                .eq("id", cloudMilestoneId)
                .eq("diary_id", cloudDiaryId);

            if (error) throw error;

            if (session?.user?.id !== userId) return;

            diaries = diaries.map((d) =>
                d.id === diary.id
                    ? {
                          ...d,
                          milestones: (d.milestones ?? []).filter(
                              (m) => m.id !== id,
                          ),
                      }
                    : d,
            );
        } catch (error) {
            console.error("[Echoes Cloud] Milestone deletion failed:", error);

            alert("Could not delete milestone: " + error.message);
        }
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

async function leaveDiary() {
    const diary = diaries.find((d) => d.id === editing);

    if (!diary?.cloudId || diary.privacy !== "shared") {
        alert("Only shared diaries can be left.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to leave this diary? " +
        "If you're the owner, ownership will transfer to a random member. " +
        "You will lose access to this diary."
    );

    if (!confirmed) return;

    const { error: leaveError } = await supabase.rpc(
        "leave_shared_diary",
        { p_diary_id: diary.cloudId }
    );

    if (leaveError) {
        alert(leaveError.message);
        return;
    }

    diaries = diaries.filter((d) => d.id !== diary.id);
    selected = null;
    editing = null;
    modal = "";
    diaryMembers = [];
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
                    "This will delete its database records and cannot be undone.",
            )
        )
            return;

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

{#if showShareModal && shareInviteUrl}
  <DiaryShareModal
    inviteUrl={shareInviteUrl}
    onClose={() => {
      showShareModal = false;
      shareInviteUrl = "";
    }}
  />
{/if}


{#if joinedDiaryWelcome}
    <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
        <div class="w-full max-w-sm rounded-3xl border border-white/10 bg-[#18151c] p-7 text-center shadow-2xl">
            <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#dca9a6]/10">
                <span class="text-3xl">♡</span>
            </div>

            <h2 class="mb-3 text-2xl font-semibold text-white">
                Welcome to your shared diary!
            </h2>

            <p class="mb-6 text-sm leading-relaxed text-white/60">
                You've successfully joined this diary.
                Your memories together start here.
            </p>

            <button
                type="button"
                onclick={() => (joinedDiaryWelcome = false)}
                class="w-full rounded-xl bg-[#dca9a6] px-4 py-3 font-medium text-[#18151c] transition hover:opacity-90"
            >
                Start Making Memories
            </button>
        </div>
    </div>
{/if}


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

{#if !selected}
    <AppSidebar
        activePage={accountSettingsOpen ? "settings" : appearanceOpen ? "appearance" : profileOpen ? "profile" : "diaries"}
        onNavigate={(page) => {
            selected = null;
            profileOpen = page === "profile";
            appearanceOpen = page === "appearance";
            accountSettingsOpen = page === "settings";
        }}
        onSignOut={signOut}
    />
{:else}

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
        {/if}
        <main class="flex-1 min-w-0 p-5 md:p-9 lg:p-12">

            {#if accountSettingsOpen}
    <AccountSettings email={session?.user?.email ?? ""} />
{:else if appearanceOpen}
    <AppAppearance accent={appAccent} onSave={saveAppAppearance} />
            {:else if profileOpen}
                <UserProfile {profile} onSave={saveProfile} />
            {:else if !current}
                <DiaryLibrary
                    {diaries}
                    onCreate={openCreate}
                    onOpen={(id) => {
                        selected = id;
                        const openedDiary = diaries.find((diary) => diary.id === id);
if (openedDiary?.privacy === "shared") {
    loadDiaryMembers(openedDiary.cloudId);
} else {
    diaryMembers = [];
}
                        appearanceOpen = false;
                        tab = "shared";
                        profileOpen = false;
                    }}
                />
            {:else}
 



                <DiaryView
                memberPreview={memberPreview}
                members={diaryMembers}
                currentUserId={session?.user?.id}
                    diary={current}
                    bind:tab
                    onBack={() => (selected = null)}
                    onShareDiary={() => promptDiaryInvitation(current)}
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
            diary={diaries.find((d) => d.id === editing)}
            {editing}
            isOwner={diaries.find((d) => d.id === editing)?.ownerId === session?.user?.id}
            {error}
            {colors}
            onClose={() => (modal = "")}
            onSave={saveDiary}
            onDelete={removeDiary}
            onLeave={leaveDiary}
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
