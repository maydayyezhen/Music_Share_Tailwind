import {createAvatar} from "@dicebear/core";
import {thumbs} from "@dicebear/collection";

export function formatDuration(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
}
export const createAvatarUrl= (username)=> {
    const avatar = createAvatar(thumbs, {
        seed: username,
    });
    const svgString = avatar.toString();

    const uint8Array = new TextEncoder().encode(svgString);
    const base64 = btoa(String.fromCharCode(...uint8Array));

    return `data:image/svg+xml;base64,${base64}`;
}
