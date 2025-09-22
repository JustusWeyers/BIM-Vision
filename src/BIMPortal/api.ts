import type {paths} from "./types";

const API_HOST = "https://via.bund.de/bim"

// @ts-ignore
export async function makeBIMPortalRequest<T extends keyof paths, M extends "get" | "post">(path: T, method: M = "get", guid?: string, apiHost: string = API_HOST): Promise<object | string | null> {
    if (path.includes("{guid}")) { // @ts-ignore
        path = path.replace("{guid}", guid);
    }

    const fullUrl = `${apiHost}${path}`;
    console.log('Making BIM Portal request to:', fullUrl);

    const response = await fetch(fullUrl, {method})
    if (response.status >= 300) {
        console.error(`BIM Portal request failed: ${response.status} ${response.statusText}`);
        return null;
    }
    
    try {
        const contentType = response.headers.get('content-type');
        console.log('Response content-type:', contentType);
        
        if (contentType?.includes('application/xml') || contentType?.includes('text/xml') || path.includes('/IDS')) {
            // Handle XML response (IDS files)
            const xmlText = await response.text();
            console.log('Received XML response, length:', xmlText.length);
            return xmlText;
        } else {
            // Handle JSON response
            const jsonData = await response.json();
            console.log('Received JSON response');
            return jsonData;
        }
    } catch (e) {
        console.error('Failed to parse BIM Portal response:', e);
        // Try to get raw text as fallback
        try {
            const text = await response.text();
            console.log('Fallback: returning raw text response, length:', text.length);
            return text;
        } catch (textError) {
            console.error('Failed to get text response:', textError);
            return null;
        }
    }
}