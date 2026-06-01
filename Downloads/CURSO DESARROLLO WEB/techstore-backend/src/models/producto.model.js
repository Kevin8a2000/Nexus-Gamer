const mongoose = require('mongoose');

// Categorías válidas para productos TechStore
const CATEGORIAS_VALIDAS = [
  'Smartphones',
  'Laptops',
  'Tablets',
  'Accesorios',
  'Computadores de Escritorio',
  'Audio',
  'Televisores',
  'Cámaras',
  'Wearables',
  'Otro'
];

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede superar 100 caracteres']
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: {
        values: CATEGORIAS_VALIDAS,
        message: '{VALUE} no es una categoría válida'
      }
    },
    ubicacion: {
      type: String,
      required: [true, 'La ubicación es obligatoria'],
      trim: true,
      maxlength: [50, 'La ubicación no puede superar 50 caracteres']
      // Ejemplos: "Bodega A", "Vitrina 1", "Estante 3"
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    }
  },
  {
    // Agrega automáticamente createdAt y updatedAt
    timestamps: true,
    // Nombre de la colección en MongoDB
    collection: 'productos'
  }
);

module.exports = mongoose.model('Producto', productoSchema);
