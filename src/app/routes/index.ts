import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { UserRoutes } from '../modules/user/user.route';
import { MessageRoutes } from '../modules/message/message.route';
import { CatalogRoutes } from '../modules/catalog/catalog.route';
import { OrderRoutes } from '../modules/order/order.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { ReviewRoutes } from '../modules/review/review.route';
import { CartRoutes } from '../modules/cart/cart.route';
import { WishlistRoutes } from '../modules/wishlist/wishlist.route';
import { InventoryRoutes } from '../modules/inventory/inventory.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/messages', route: MessageRoutes },
  { path: '/catalog', route: CatalogRoutes },
  { path: '/orders', route: OrderRoutes },
  { path: '/payments', route: PaymentRoutes },
  { path: '/reviews', route: ReviewRoutes },
  { path: '/cart', route: CartRoutes },
  { path: '/wishlist', route: WishlistRoutes },
  { path: '/inventory', route: InventoryRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
