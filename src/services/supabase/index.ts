
import { sectorService } from './sectorService';
import { serviceTypeService } from './serviceTypeService';
import { photoService } from './photoService';

// Export all the services
export const supabaseService = {
  ...sectorService,
  ...serviceTypeService,
  ...photoService
};
