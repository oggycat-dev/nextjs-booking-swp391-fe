/**
 * API Exports
 * Central export point for all API modules
 */

export { authApi } from './auth';
export { bookingApi } from './booking';
export { campusApi } from './campus';
export { facilityApi } from './facility';
export { facilityTypeApi } from './facility-type';
export { profileApi } from './profile';
export { usersApi } from './users';
export { notificationsApi } from './notifications';

// Re-export API client utilities
export { apiConfig, getApiUrl, getAuthHeaders, apiFetch, api } from '../api-client';

