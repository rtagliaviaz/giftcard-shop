import { AppDataSource } from "./data-source";

export async function initializeDatabase() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log("✅ Database connected"); 
  }
  return AppDataSource;
}