import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { adminRateLimit } from "../middleware/rateLimit";
import { productsController } from "../controllers/products";
import { categoriesController } from "../controllers/categories";
import { farmsController } from "../controllers/farms";
import { promosController } from "../controllers/promos";
import { reviewsController } from "../controllers/reviews";
import { settingsController } from "../controllers/settings";
import { socialsController } from "../controllers/socials";
import { eventsController } from "../controllers/events";
import { cartController } from "../controllers/cart";
import { adminUsersController } from "../controllers/adminUsers";
import { uploadController } from "../controllers/upload";

export const adminRoutes = Router();

// All admin routes require authentication and rate limiting
adminRoutes.use(authenticateToken);
adminRoutes.use(requireAdmin);
adminRoutes.use(adminRateLimit);

// Products CRUD
adminRoutes.post("/products", productsController.create);
adminRoutes.put("/products/:id", productsController.update);
adminRoutes.delete("/products/:id", productsController.delete);

// Categories CRUD
adminRoutes.post("/categories", categoriesController.create);
adminRoutes.put("/categories/:id", categoriesController.update);
adminRoutes.delete("/categories/:id", categoriesController.delete);

// Farms CRUD
adminRoutes.post("/farms", farmsController.create);
adminRoutes.put("/farms/:id", farmsController.update);
adminRoutes.delete("/farms/:id", farmsController.delete);

// Promos CRUD
adminRoutes.post("/promos", promosController.create);
adminRoutes.put("/promos/:id", promosController.update);
adminRoutes.delete("/promos/:id", promosController.delete);

// Reviews CRUD
adminRoutes.post("/reviews", reviewsController.create);
adminRoutes.put("/reviews/:id", reviewsController.update);
adminRoutes.delete("/reviews/:id", reviewsController.delete);

// Settings
adminRoutes.post("/settings", settingsController.update);

// Socials CRUD
adminRoutes.post("/socials", socialsController.create);
adminRoutes.put("/socials/:id", socialsController.update);
adminRoutes.delete("/socials/:id", socialsController.delete);

// Events CRUD
adminRoutes.post("/events", eventsController.create);
adminRoutes.put("/events/:id", eventsController.update);
adminRoutes.delete("/events/:id", eventsController.delete);

// Cart settings
adminRoutes.get("/cart-settings", cartController.getSettings);
adminRoutes.post("/cart-settings", cartController.updateSettings);

// Admin users CRUD
adminRoutes.get("/admin-users", adminUsersController.getAll);
adminRoutes.post("/admin-users", adminUsersController.create);
adminRoutes.put("/admin-users/:id", adminUsersController.update);
adminRoutes.delete("/admin-users/:id", adminUsersController.delete);

// Upload
adminRoutes.post("/upload", uploadController.upload);
adminRoutes.post("/blob-upload", uploadController.blobUpload);

