import express, { Request, Response } from 'express'; // Server Framework: Express
import { pool } from './db';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Requests and responses containing payloads must use application/json

const apiRouter = express.Router();

// ==========================================
// A. Customers Resource (/api/v1/customers)
// ==========================================

// 1. GET /api/v1/customers
apiRouter.get('/customers', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM customer'); // Raw SQL via pool.query() without ORMs
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' }); // Catch database errors and return proper HTTP status codes
  }
});

// 2. GET /api/v1/customers/:id
apiRouter.get('/customers/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM customer WHERE customer_id = $1', [req.params.id]); // Parameterized values ($1)
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not Found' }); // 404 Not Found if no customer exists
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. POST /api/v1/customers
apiRouter.post('/customers', async (req: Request, res: Response) => {
  const { customer_id, customer_name, city, membership_level } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO customer (customer_id, customer_name, city, membership_level) VALUES ($1, $2, $3, $4) RETURNING *',
      [customer_id, customer_name, city, membership_level]
    );
    res.status(201).json(result.rows[0]); // Returns the newly created customer object
  } catch (err) {
    res.status(400).json({ error: 'Bad Request' });
  }
});

// 4. PUT /api/v1/customers/:id
apiRouter.put('/customers/:id', async (req: Request, res: Response) => {
  const { city, membership_level } = req.body;
  try {
    const result = await pool.query(
      'UPDATE customer SET city = $1, membership_level = $2 WHERE customer_id = $3 RETURNING *',
      [city, membership_level, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not Found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Bad Request' });
  }
});

// 5. DELETE /api/v1/customers/:id
apiRouter.delete('/customers/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM customer WHERE customer_id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not Found' });
    res.status(204).send(); // Success message or empty response
  } catch (err) {
    res.status(400).json({ error: 'Bad Request' });
  }
});

// ==========================================
// B. Products Resource (/api/v1/products)
// ==========================================

// 1. GET /api/v1/products
apiRouter.get('/products', async (req: Request, res: Response) => {
  const { category } = req.query;
  try {
    if (category) {
      const result = await pool.query('SELECT * FROM product WHERE category = $1', [category as string]); // Filtering by category
      res.status(200).json(result.rows);
    } else {
      const result = await pool.query('SELECT * FROM product');
      res.status(200).json(result.rows);
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. GET /api/v1/products/:id
apiRouter.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM product WHERE product_id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not Found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. POST /api/v1/products
apiRouter.post('/products', async (req: Request, res: Response) => {
  const { product_id, product_name, category, unit_price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO product (product_id, product_name, category, unit_price) VALUES ($1, $2, $3, $4) RETURNING *',
      [product_id, product_name, category, unit_price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Bad Request' });
  }
});

// 4. PATCH /api/v1/products/:id/price
apiRouter.patch('/products/:id/price', async (req: Request, res: Response) => {
  const { unit_price } = req.body;
  try {
    const result = await pool.query(
      'UPDATE product SET unit_price = $1 WHERE product_id = $2 RETURNING *',
      [unit_price, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not Found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Bad Request' });
  }
});

// ==========================================
// C. Orders Resource (/api/v1/orders)
// ==========================================

// 1. GET /api/v1/orders
apiRouter.get('/orders', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM orders');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. GET /api/v1/orders/customer/:customerId
apiRouter.get('/orders/customer/:customerId', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE customer_id = $1', [req.params.customerId]); // Fetch directly from single relations without joining
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. POST /api/v1/orders
apiRouter.post('/orders', async (req: Request, res: Response) => {
  const { order_id, customer_id, order_date, shipping_city } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO orders (order_id, customer_id, order_date, shipping_city) VALUES ($1, $2, $3, $4) RETURNING *',
      [order_id, customer_id, order_date, shipping_city]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Bad Request' });
  }
});

// 4. DELETE /api/v1/orders/:id
apiRouter.delete('/orders/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM orders WHERE order_id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not Found' });
    res.status(200).json({ message: 'Success' });
  } catch (err) {
    res.status(400).json({ error: 'Bad Request' });
  }
});

// ==========================================
// D. Order Items Resource (/api/v1/order-items)
// ==========================================

// 1. GET /api/v1/order-items/:orderId
apiRouter.get('/order-items/:orderId', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM order_item WHERE order_id = $1', [req.params.orderId]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. POST /api/v1/order-items
apiRouter.post('/order-items', async (req: Request, res: Response) => {
  const { order_id, product_id, quantity, discount } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO order_item (order_id, product_id, quantity, discount) VALUES ($1, $2, $3, $4) RETURNING *',
      [order_id, product_id, quantity, discount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Bad Request' });
  }
});

// ==========================================
// E. Vendors & Supplies Resource (/api/v1/vendors & /api/v1/supplies)
// ==========================================

// 1. GET /api/v1/vendors
apiRouter.get('/vendors', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM vendor');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. GET /api/v1/supplies/vendor/:vendorId
apiRouter.get('/supplies/vendor/:vendorId', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM supplies WHERE vendor_id = $1', [req.params.vendorId]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. PUT /api/v1/supplies/:vendorId/:productId
apiRouter.put('/supplies/:vendorId/:productId', async (req: Request, res: Response) => {
  const { stock_quantity } = req.body;
  try {
    const result = await pool.query(
      'UPDATE supplies SET stock_quantity = $1 WHERE vendor_id = $2 AND product_id = $3 RETURNING *',
      [stock_quantity, req.params.vendorId, req.params.productId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not Found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Bad Request' });
  }
});

// All endpoints must be prefixed with /api/v1
app.use('/api/v1', apiRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});