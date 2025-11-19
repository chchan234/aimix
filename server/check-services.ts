import { db } from './src/db/index.js';
import { services } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function checkServices() {
  try {
    console.log('Checking services in database...\n');

    const allServices = await db
      .select({
        serviceType: services.serviceType,
        nameKo: services.nameKo,
        creditCost: services.creditCost,
        isActive: services.isActive,
      })
      .from(services)
      .where(eq(services.category, 'fortune'))
      .orderBy(services.serviceType);

    console.log('Fortune Services:');
    console.log('==========================================');
    allServices.forEach((service) => {
      console.log(`Service Type: ${service.serviceType}`);
      console.log(`Name: ${service.nameKo}`);
      console.log(`Credit Cost: ${service.creditCost}`);
      console.log(`Active: ${service.isActive}`);
      console.log('------------------------------------------');
    });

    console.log(`\nTotal: ${allServices.length} services found`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkServices();
