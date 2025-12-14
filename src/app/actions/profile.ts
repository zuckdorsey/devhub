"use server";

import { auth } from "@/auth";
import { saveSetting, getSetting } from "@/lib/settings";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const avatar = formData.get("avatar") as string;
    const title = formData.get("title") as string;

    if (name) await saveSetting("user_name", name);
    if (avatar) await saveSetting("user_avatar", avatar);
    if (title) await saveSetting("user_title", title);

    revalidatePath("/profile");
    revalidatePath("/");
}

export async function changePin(formData: FormData) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const currentPin = formData.get("currentPin") as string;
    const newPin = formData.get("newPin") as string;

    if (!newPin || newPin.length < 4) {
        throw new Error("New PIN must be at least 4 digits");
    }

    const hashedPin = await getSetting("auth_pin_hash");

    // If a PIN is already set, verify it
    if (hashedPin) {
        const isValid = await bcrypt.compare(currentPin, hashedPin);
        if (!isValid) {
            throw new Error("Incorrect current PIN");
        }
    } else {
        // If no PIN is set (first time), verify against default "123456"
        if (currentPin !== "123456") {
            throw new Error("Incorrect current PIN (Default is 123456)");
        }
    }

    const newHashedPin = await bcrypt.hash(newPin, 10);
    await saveSetting("auth_pin_hash", newHashedPin);

    revalidatePath("/profile");
}
