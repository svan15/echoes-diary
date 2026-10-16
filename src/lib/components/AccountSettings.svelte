
<script>
    import { Mail, LockKeyhole, ShieldCheck } from "lucide-svelte";
    import { supabase } from "$lib/supabase.js";

    let { email = "" } = $props();
    let newEmail = $state("");
let emailSaving = $state(false);
let emailMessage = $state("");
let newPassword = $state("");
let confirmPassword = $state("");
let passwordSaving = $state(false);
let passwordMessage = $state("");
async function changeEmail() {
    const updatedEmail = newEmail.trim();

    if (!updatedEmail || emailSaving) return;

    if (updatedEmail.toLowerCase() === email.toLowerCase()) {
        emailMessage = "Please enter a different email address.";
        return;
    }

    emailSaving = true;
    emailMessage = "";

    try {
        const { error } = await supabase.auth.updateUser({
            email: updatedEmail
        });

        if (error) throw error;

        emailMessage =
            "Email change requested. Check your email for a confirmation link.";
        newEmail = "";
    } catch (error) {
        emailMessage = error.message || "Could not update your email.";
    } finally {
        emailSaving = false;
    }
}
async function changePassword() {
    if (passwordSaving) return;

    passwordMessage = "";

    if (newPassword.length < 8) {
        passwordMessage = "Password must be at least 8 characters.";
        return;
    }

    if (newPassword !== confirmPassword) {
        passwordMessage = "Passwords do not match.";
        return;
    }

    passwordSaving = true;

    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        passwordMessage = "Your password has been updated successfully.";
        newPassword = "";
        confirmPassword = "";
    } catch (error) {
        passwordMessage = error.message || "Could not update your password.";
    } finally {
        passwordSaving = false;
    }
}
</script>

<div class="max-w-3xl mx-auto space-y-8">
    <div>
        <p class="text-[11px] uppercase tracking-[0.25em] text-[#c99d98] mb-3">
            YOUR ACCOUNT
        </p>
        <h1 class="serif text-4xl text-[#f5e9e6] mb-3">
            Account Settings
        </h1>
        <p class="text-sm text-[#bcb4b5]">
            Manage your login details and account security.
        </p>
    </div>

    <div class="rounded-2xl border border-[#302d31] bg-[#181719] p-6 space-y-5">
        <div class="flex items-center gap-3">
            <Mail size={20} class="text-[#dca9a6]" />
            <h2 class="serif text-2xl text-[#f5e9e6]">Email Address</h2>
        </div>

        <p class="text-sm text-[#bcb4b5]">
            Current email: {email || "Not available"}
        </p>

        <p class="text-xs text-[#8f858a]">
            Email changes will require confirmation for your security.
        </p>
        
<div class="space-y-3">
    <label for="new-email" class="block text-sm text-[#bcb4b5]">
        New Email Address
    </label>

    <input
        id="new-email"
        type="email"
        bind:value={newEmail}
        placeholder="Enter your new email"
        autocomplete="email"
        class="w-full rounded-xl border border-[#302d31] bg-[#111112] px-4 py-3 text-sm text-white outline-none focus:border-[#dca9a6]"
    />

    <button
        type="button"
        onclick={changeEmail}
        disabled={emailSaving || !newEmail.trim()}
        class="rounded-xl bg-[#dca9a6] px-5 py-2.5 text-sm font-medium text-[#211a23] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
        {emailSaving ? "Updating..." : "Change Email"}
    </button>

    {#if emailMessage}
        <p class="text-sm text-[#dca9a6]">{emailMessage}</p>
    {/if}
</div>

    </div>

    <div class="rounded-2xl border border-[#302d31] bg-[#181719] p-6 space-y-5">
        <div class="flex items-center gap-3">
            <LockKeyhole size={20} class="text-[#dca9a6]" />
            <h2 class="serif text-2xl text-[#f5e9e6]">Password</h2>
        </div>

        <p class="text-sm text-[#bcb4b5]">
            Update your password to keep your account secure.
        </p>
        
<div class="space-y-4">
    <div class="space-y-2">
        <label for="new-password" class="block text-sm text-[#bcb4b5]">
            New Password
        </label>
        <input
            id="new-password"
            type="password"
            bind:value={newPassword}
            placeholder="Enter your new password"
            autocomplete="new-password"
            minlength="8"
            class="w-full rounded-xl border border-[#302d31] bg-[#111112] px-4 py-3 text-sm text-white outline-none focus:border-[#dca9a6]"
        />
    </div>

    <div class="space-y-2">
        <label for="confirm-password" class="block text-sm text-[#bcb4b5]">
            Confirm New Password
        </label>
        <input
            id="confirm-password"
            type="password"
            bind:value={confirmPassword}
            placeholder="Confirm your new password"
            autocomplete="new-password"
            class="w-full rounded-xl border border-[#302d31] bg-[#111112] px-4 py-3 text-sm text-white outline-none focus:border-[#dca9a6]"
        />
    </div>

    <button
        type="button"
        onclick={changePassword}
        disabled={passwordSaving || !newPassword || !confirmPassword}
        class="rounded-xl bg-[#dca9a6] px-5 py-2.5 text-sm font-medium text-[#211a23] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
        {passwordSaving ? "Updating..." : "Change Password"}
    </button>

    {#if passwordMessage}
        <p class="text-sm text-[#dca9a6]">{passwordMessage}</p>
    {/if}
</div>

    </div>

    <div class="flex items-start gap-3 text-xs text-[#8f858a]">
        <ShieldCheck size={18} class="shrink-0 text-[#c99d98]" />
        <p>
            Changes to your account credentials are managed securely through Supabase Authentication.
        </p>
    </div>
</div>
