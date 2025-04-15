import { logger } from "@/server";
import seedCategories from "./category_seeders";
import seedProducts from "./product_seeder";
import seedReviews from "./review_seeder";
import seedUsers from "./user_seeders";

const runSeeders = async () => {
  logger.info("Seeders started");
  await seedUsers();
  await seedCategories();
  await seedProducts();
  await seedReviews();
  logger.info("Seeders succeeded");
};

runSeeders().catch((error) => {
  logger.error("Seeders failed:", error);
  process.exit(1);
});
