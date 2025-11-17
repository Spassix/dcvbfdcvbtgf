import { Router } from "express";
import { generalRateLimit } from "../middleware/rateLimit";
import { productsController } from "../controllers/products";
import { categoriesController } from "../controllers/categories";
import { farmsController } from "../controllers/farms";
import { promosController } from "../controllers/promos";
import { reviewsController } from "../controllers/reviews";
import { settingsController } from "../controllers/settings";
import { socialsController } from "../controllers/socials";
import { eventsController } from "../controllers/events";
import { cartController } from "../controllers/cart";

export const publicRoutes = Router();

// Apply rate limiting to all public routes
publicRoutes.use(generalRateLimit);

// Products
publicRoutes.get("/products", productsController.getAll);
publicRoutes.get("/products/:id", productsController.getById);

// Categories
publicRoutes.get("/categories", categoriesController.getAll);
publicRoutes.get("/categories/:id", categoriesController.getById);

// Farms
publicRoutes.get("/farms", farmsController.getAll);
publicRoutes.get("/farms/:id", farmsController.getById);

// Promos (public endpoint for validation)
publicRoutes.get("/promos", promosController.getPublic);

// Reviews
publicRoutes.get("/reviews", reviewsController.getAll);

// Settings
publicRoutes.get("/settings", settingsController.getAll);
publicRoutes.get("/settings/:key", settingsController.getByKey);

// Socials
publicRoutes.get("/socials", socialsController.getAll);

// Events
publicRoutes.get("/events", eventsController.getAll);

// Cart services
publicRoutes.get("/cart_services", cartController.getServices);

