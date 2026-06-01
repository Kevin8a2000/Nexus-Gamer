const Producto = require('../models/producto.model');
const { AppError, catchAsync } = require('../middleware/errorHandler.middleware');

// ─────────────────────────────────────────────
// GET /api/productos
// Retorna todos los productos del inventario
// ─────────────────────────────────────────────
exports.obtenerProductos = catchAsync(async (req, res, next) => {
  const productos = await Producto.find().sort({ createdAt: -1 });
  res.status(200).json({
    ok: true,
    total: productos.length,
    productos
  });
});

// ─────────────────────────────────────────────
// GET /api/productos/:id
// Retorna un producto por su ID
// ─────────────────────────────────────────────
exports.obtenerProductoPorId = catchAsync(async (req, res, next) => {
  const producto = await Producto.findById(req.params.id);

  if (!producto) {
    return next(new AppError('Producto no encontrado', 404));
  }

  res.status(200).json({ ok: true, producto });
});

// ─────────────────────────────────────────────
// POST /api/productos
// Crea un nuevo producto
// Body esperado: { nombre, categoria, ubicacion, precio }
// ─────────────────────────────────────────────
exports.crearProducto = catchAsync(async (req, res, next) => {
  const { nombre, categoria, ubicacion, precio } = req.body;

  const nuevoProducto = await Producto.create({
    nombre,
    categoria,
    ubicacion,
    precio
  });

  res.status(201).json({
    ok: true,
    mensaje: 'Producto creado exitosamente',
    producto: nuevoProducto
  });
});

// ─────────────────────────────────────────────
// PUT /api/productos/:id
// Actualiza un producto existente
// Body esperado: cualquier campo a modificar
// ─────────────────────────────────────────────
exports.actualizarProducto = catchAsync(async (req, res, next) => {
  const { nombre, categoria, ubicacion, precio } = req.body;

  const productoActualizado = await Producto.findByIdAndUpdate(
    req.params.id,
    { nombre, categoria, ubicacion, precio },
    {
      new: true,
      runValidators: true
    }
  );

  if (!productoActualizado) {
    return next(new AppError('Producto no encontrado', 404));
  }

  res.status(200).json({
    ok: true,
    mensaje: 'Producto actualizado exitosamente',
    producto: productoActualizado
  });
});

// ─────────────────────────────────────────────
// DELETE /api/productos/:id
// Elimina un producto por su ID
// ─────────────────────────────────────────────
exports.eliminarProducto = catchAsync(async (req, res, next) => {
  const productoEliminado = await Producto.findByIdAndDelete(req.params.id);

  if (!productoEliminado) {
    return next(new AppError('Producto no encontrado', 404));
  }

  res.status(200).json({
    ok: true,
    mensaje: `Producto "${productoEliminado.nombre}" eliminado exitosamente`
  });
});
