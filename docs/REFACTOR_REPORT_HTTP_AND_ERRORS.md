# Refactor Report: Deprecated Modules Removed & Unified Error Handling

**Date:** Refactor applied to remove deprecated API/config modules and centralize error handling.

---

## 1. Removed files

| File | Reason |
|------|--------|
| `src/shared/api/client.ts` | Deprecated; re-exported `api` and provided a non-i18n `getErrorMessage`. All consumers now use `shared/services/http/api` and `shared/services/http/errorMessage`. |
| `src/shared/config/api.ts` | Deprecated; only re-exported `API_BASE_URL` from `shared/constants/env`. No remaining imports; all code already used `constants/env`. |

---

## 2. New module

| File | Purpose |
|------|---------|
| `src/shared/services/http/errorMessage.ts` | **Unified error helper.** Exports: (1) `getMessageFromHttpError(e: HttpError): string` – maps `HttpError.kind` to i18n messages via `t('error.network')`, `t('error.timeout')`, `t('error.server')`, `t('error.unknown')` and falls back to `e.message`; (2) `getErrorMessage(error: unknown): string` – normalizes any thrown value (Axios errors, `Error`, etc.) via `toHttpError()` then returns the same i18n message. Supports Axios errors, `HttpError`, and i18n. |

---

## 3. Changed imports

| Module | Before | After |
|--------|--------|--------|
| `src/features/auth/data/authApi.ts` | `getErrorMessage` from `../../../shared/api/client` | `getErrorMessage` from `../../../shared/services/http/errorMessage` |
| `src/features/auth/data/authApi.ts` | `AxiosError` from `axios` (used only for cast) | Removed; `getErrorMessage(error)` accepts `unknown` |
| `src/features/requests/data/requestApi.ts` | `getErrorMessage` from `../../../shared/api/client`, `AxiosError` from `axios` | `getErrorMessage` from `../../../shared/services/http/errorMessage`; removed `AxiosError` import |
| `src/features/providers/data/providersApi.ts` | No error helper | `getErrorMessage` from `../../../shared/services/http/errorMessage`; added try/catch in `fetchNearbyProviders` and `fetchProviderById` |
| `src/shared/providers/HttpEventsBinder.tsx` | Local `getErrorMessage(e: HttpError)` and `t` from i18n | `getMessageFromHttpError` from `../services/http/errorMessage` (no direct `t` import) |

**Note:** No code was importing `shared/config/api.ts`; `API_BASE_URL` was already used from `shared/constants/env` everywhere.

---

## 4. Improved types (httpClient)

| Location | Before | After |
|----------|--------|--------|
| `src/shared/services/http/httpClient.ts` | `(err.response.data as any)?.message` / `?.error` | Introduced `ApiErrorBody` interface `{ message?: string; error?: string }` and typed `err.response.data as ApiErrorBody \| undefined` |
| `src/shared/services/http/httpClient.ts` | `(originalConfig.headers as any).Authorization = ...` | `originalConfig.headers.Authorization = ...` (Axios typings allow this on `InternalAxiosRequestConfig['headers']`) |
| `src/shared/services/http/httpClient.ts` | `toHttpError` private | Exported `toHttpError` and `ApiErrorBody` for use by `errorMessage.ts` |

---

## 5. Summary

- **Removed:** 2 deprecated files (`shared/api/client.ts`, `shared/config/api.ts`).
- **Added:** 1 unified error module (`shared/services/http/errorMessage.ts`) with i18n and support for both `unknown` and `HttpError`.
- **Updated:** 4 API/UI modules to use the new error helper; 1 HTTP module with better types and exported `toHttpError`/`ApiErrorBody`.
- **Result:** Single place for user-facing HTTP/API error messages, consistent i18n, and no remaining references to deprecated modules or `any` in the HTTP error path.
