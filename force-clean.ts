import { rm } from 'node:fs/promises';
import path from 'node:path';

export async function forceClean() {
  try {
    const behaviorPacksDir = path.join(
      process.env.CUSTOM_DEPLOYMENT_PATH || '',
      'development_behavior_packs',
      process.env.PROJECT_NAME || ''
    );
    
    const resourcePacksDir = path.join(
      process.env.CUSTOM_DEPLOYMENT_PATH || '',
      'development_resource_packs',
      process.env.PROJECT_NAME || ''
    );

    await Promise.all([
      rm(behaviorPacksDir, { recursive: true, force: true }),
      rm(resourcePacksDir, { recursive: true, force: true })
    ]);

    console.log('Successfully cleaned development folders.');
  } catch (error) {
    console.error('Failed to clean directories:', error);
    throw error;
  }
}
