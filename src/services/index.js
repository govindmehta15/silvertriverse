export { authService } from './authService';
export { relicService } from './relicService';
export { filmService } from './filmService';
export { postService } from './postService';
export { merchandiseService } from './merchandiseService';
export { realityService } from './realityService';
export { storyService } from './storyService';
export { communityService } from './communityService';
export { reelityService } from './reelityService';
export { pipelineService } from './pipelineService';
export { aiWriterService } from './aiWriterService';
export { plotsService } from './plotsService';
export { simulateApi, getData, setData, updateData } from './storageService';

/*
 * ==========================================
 * EXAMPLE USAGE OF MOCK BACKEND SERVICE LAYER
 * ==========================================
 *
 * import { authService, relicService } from '../services';
 * 
 * // 1. Authenticate User (Async)
 * const handleLogin = async (email, password) => {
 *   try {
 *     const response = await authService.login(email, password);
 *     if (response.success) {
 *       console.log('Logged in as', response.data.name);
 *     } else {
 *       console.error(response.error);
 *     }
 *   } catch (err) {
 *       console.error(err);
 *   }
 * };
 * 
 * // 2. Fetch Relics
 * const loadAuctions = async () => {
 *   const response = await relicService.getRelics();
 *   if (response.success) {
 *      setRelics(response.data);
 *   }
 * };
 *
 * // 3. Place a Bid
 * const handleBid = async (relicId, amount) => {
 *   const user = await authService.getCurrentUser();
 *   if (user.success) {
 *      const bidRes = await relicService.placeBid(relicId, user.data.id, amount);
 *      if (bidRes.success) {
 *         // Bid placed!
 *      } else {
 *         // e.g. "Minimum bid is $1,500"
 *         alert(bidRes.error); 
 *      }
 *   }
 * };
 */
