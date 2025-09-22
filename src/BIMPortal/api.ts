import type {paths} from "./types";

const API_HOST = "https://via.bund.de/bim"

// @ts-ignore
export async function makeBIMPortalRequest<T extends keyof paths, M extends "get" | "post">(path: T, method: M = "get", guid?: string, apiHost: string = API_HOST): Promise<paths[T][M]["responses"]["200"] | null> {
    if (path.includes("{guid}")) { // @ts-ignore
        path = path.replace("{guid}", guid);
    }

    const response = await fetch(new URL(path, apiHost), {method})
    try {
        return await response.json();
    } catch (e) {
        return null;
    }
}