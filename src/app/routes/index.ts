import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { UserRoutes } from '../modules/user/user.route';
import { MessageRoutes } from '../modules/message/message.route';
import { ProductRoutes } from '../modules/product/product.route';
import { OrderRoutes } from '../modules/order/order.route';
import { PaymentRoutes } from '../modules/payment/payment.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/messages', route: MessageRoutes },
  { path: '/products', route: ProductRoutes },
  { path: '/orders', route: OrderRoutes },
  { path: '/payments', route: PaymentRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
