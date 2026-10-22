export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initScheduler } = await import('@/server/services/schedulerService.js');
    initScheduler();
  }
}
