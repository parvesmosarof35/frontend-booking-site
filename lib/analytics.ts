import api from './axios';

export const trackEvent = async (
  type: 'view' | 'click',
  targetType: 'menuItem' | 'offer' | 'page' | 'cta',
  targetId: string,
  meta?: Record<string, any>,
) => {
  try {
    await api.post('/analytics/track', {
      type,
      targetType,
      targetId,
      meta: meta || {},
    });
  } catch (error) {
    // Non-blocking analytics tracking
    console.debug('Analytics track error:', error);
  }
};
