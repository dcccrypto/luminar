/**
 * API client for Luminar backend
 * Handles all API calls with proper error handling and authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  retry_after?: number
}

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public retryAfter?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data: ApiResponse<T> = await response.json()

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error || 'unknown_error',
      data.message || 'An error occurred',
      data.retry_after
    )
  }

  return data as T
}

// =============================================================================
// CLUE API
// =============================================================================

export interface ClueSubmitRequest {
  answer: string
}

export interface ClueSubmitResponse {
  fragment: string
  proof_id: string
}

export async function submitClue(
  clueId: number,
  data: ClueSubmitRequest,
  accessToken: string,
  turnstileToken: string
): Promise<ClueSubmitResponse> {
  return apiRequest<ClueSubmitResponse>(`/v1/clues/${clueId}/submit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-turnstile-token': turnstileToken,
    },
    body: JSON.stringify(data),
  })
}

// =============================================================================
// CHAPTER API
// =============================================================================

export interface ChapterQualifyResponse {
  qualified: boolean
  rank?: number
  reason?: string
}

export async function qualifyForChapter(
  chapterId: number,
  accessToken: string,
  turnstileToken: string
): Promise<ChapterQualifyResponse> {
  return apiRequest<ChapterQualifyResponse>(`/v1/chapters/${chapterId}/qualify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-turnstile-token': turnstileToken,
    },
  })
}

export interface SlotsResponse {
  remaining: number
}

export async function getChapterSlots(chapterId: number): Promise<SlotsResponse> {
  return apiRequest<SlotsResponse>(`/v1/chapters/${chapterId}/slots`)
}

export interface ClaimRequest {
  code: string
  to: string
}

export interface ClaimResponse {
  status: string
  tx_sig: string
}

export async function claimReward(
  chapterId: number,
  data: ClaimRequest,
  accessToken: string,
  turnstileToken: string
): Promise<ClaimResponse> {
  return apiRequest<ClaimResponse>(`/v1/chapters/${chapterId}/claim`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-turnstile-token': turnstileToken,
    },
    body: JSON.stringify(data),
  })
}

// =============================================================================
// ADMIN API
// =============================================================================

export interface EndChapterResponse {
  chapter_pack_url: string
  winners_count: number
  total_payout: number
}

export async function endChapter(
  chapterId: number,
  accessToken: string
): Promise<EndChapterResponse> {
  return apiRequest<EndChapterResponse>(`/v1/admin/chapters/${chapterId}/end`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

// =============================================================================
// USER PROGRESS API
// =============================================================================

export interface UserProgress {
  proofs: Array<{
    clue_id: number
    verified_at: string
  }>
  qualifications: Array<{
    chapter_id: number
    rank: number
    completed_at: string
  }>
}

export async function getUserProgress(accessToken: string): Promise<UserProgress> {
  return apiRequest<UserProgress>('/v1/user/progress', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

// =============================================================================
// ERROR HANDLING UTILITIES
// =============================================================================

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export function getRetryAfter(error: unknown): number | undefined {
  if (isApiError(error)) {
    return error.retryAfter
  }
  return undefined
}
