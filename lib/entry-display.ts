// A deliberately public, non-secret presentation gate. This is not authorization.
// The API is intentionally public; visitors can bypass this screen.
export const ENTRY_PHRASE='TOKYO1129';
export const ENTRY_FLAG_KEY='tokyo-trip-entry:v1';
export const ENTRY_FLAG_VALUE='entered';
export function matchesEntryPhrase(value:string){return value.trim().toUpperCase()===ENTRY_PHRASE;}
export function hasEntryFlag(value:string|null){return value===ENTRY_FLAG_VALUE;}
