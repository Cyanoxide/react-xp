/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Umami website ID. Optional: absent from any build but the live one. */
    readonly VITE_UMAMI_WEBSITE_ID?: string;
}
