/**
 * Search API
 * 
 * Arama ve öneri ile ilgili API endpoints.
 */

import { apiClient, type ApiResponse } from './apiClient';
import type { SearchSuggestionsResponse } from "../../types/common/search.types";

/**
 * Search & Suggestions API
 */
export const searchAPI = {
  getSuggestions: (query: string): Promise<ApiResponse<SearchSuggestionsResponse>> =>
    apiClient.get<ApiResponse<SearchSuggestionsResponse>>("/v1.0/suggestions", { params: { query } }).then(res => res.data),

  globalSearch: (data: { query: string; includeUsers: boolean }): Promise<ApiResponse<any>> =>
    apiClient.get<ApiResponse<any>>("/v1.0/global", { params: data }).then(res => res.data),
}; 