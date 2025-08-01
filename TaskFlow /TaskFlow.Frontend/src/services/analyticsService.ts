/**
 * Analytics Service - Refactored
 * 
 * Bu dosya artık sadece bir wrapper. Gerçek functionality
 * src/services/analytics/ klasöründeki modüler servislerde.
 */

export * from './analytics';
export { AnalyticsService as default, getAnalytics } from './analytics'; 