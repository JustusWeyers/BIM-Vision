import type {paths} from "./types";

const API_HOST = "https://via.bund.de/bim/"

// @ts-ignore
export async function makeBIMPortalRequest<T extends keyof paths, M extends "get" | "post">(path: T, method: M = "get", guid: string | undefined = undefined, apiHost: string = API_HOST, body: string | undefined = undefined, bearer: string | undefined = undefined): Promise<object | null> {
    let fixedPath: null | string = null;

    if (path.includes("{guid}")) {
        fixedPath = path.replace("{guid}", guid);
    }

    fixedPath = `.${fixedPath ?? path}`;

    const response = await fetch(new URL(fixedPath, apiHost), {
        method, headers: bearer ? {
            authorization: `Bearer ${bearer}`,
        } : undefined,
        body
    })
    if (response.status >= 300) {
        return null;
    }
    try {
        return await response.json();
    } catch (e) {
        return null;
    }
}