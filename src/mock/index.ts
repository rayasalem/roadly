/**
 * موك داتا موحدة — نفس الـ IDs والأسماء للعميل، المزود، والأدمن.
 * - mockUsers: عملاء (user_1, user_2)، أدمن (admin_1)، getMockLoginUser(role) للتجربة.
 * - mockProviders: مزودون (mechanic_1.., tow_1.., rental_1..) مع مواقع وحالات.
 * - mockRequests: طلبات مرتبطة بـ customerId / providerId من أعلاه.
 * - mockNotifications: إشعارات مرتبطة بـ requestId من mockRequests.
 * - mockServices: خدمات للأدمن (mechanic | tow | rental).
 */
export * from './mockUsers';
export * from './mockProviders';
export * from './mockCars';
export * from './mockRequests';
export * from './mockLocations';
export * from './mockNotifications';
export * from './mockServices';

