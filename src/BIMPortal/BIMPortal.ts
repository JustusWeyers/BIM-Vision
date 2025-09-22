import type { paths } from "./types";

const API_HOST = ""

export async function makeBIMPortalRequest<T keyof paths, M extends "get" | "post">(path: T, method: M = "get", guid?: string, apiHost: string = API_HOST): Promise<paths[T][M] | null> {
    if (path.includes("{guid}"))
        path = path.replace("{guid}", guid);

    const response = await fetch(new URL(path, apiHost), { method })
    try {
        return await response.json();
    } catch (e) {
        return null;
    }
}