const Pedido = require('../models/Pedido');
const Material = require('../models/Material');
const DetallePedido = require('../models/DetallePedido');
const Proveedor = require('../models/Proveedor');
const Empresa = require('../models/Empresa');
const Usuario = require('../models/Usuario');

// Crear un nuevo pedido y sus detalles
exports.create = async (req, res) => {
  const { fecha_pedido, fecha_entrega, forma_pago, estado, Usuario_id_usuario, Proveedor_id_proveedor, Material_id_material, cantidad } = req.body;

  try {
    // Crear el pedido
    const pedido = await Pedido.create({
      fecha_pedido,
      fecha_entrega,
      forma_pago,
      estado,
      Usuario_id_usuario,
      Proveedor_id_proveedor
    });

    // Obtener el precio_unitario del material
    const material = await Material.findByPk(Material_id_material);
    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    // Calcular el subtotal
    const subtotal = cantidad * material.precio_unitario;

    // Crear el detalle del pedido
    const detallePedido = await DetallePedido.create({
      cantidad,
      subtotal,
      Pedido_id_pedido: pedido.id_pedido,
      Material_id_material
    });

    res.status(201).json({ pedido, detallePedido });
  } catch (error) {
    console.error('Error al crear el pedido y su detalle:', error);
    res.status(500).json({ error: 'Error al crear el pedido y su detalle.' });
  }
};

// Obtener todos los pedidos
exports.findAll = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [
        {
          model: Proveedor,
          attributes: ['razon_social']
        },
        {
          model: DetallePedido,
          include: [
            {
              model: Material,
              attributes: ['nombre', 'precio_unitario']
            }
          ]
        }
      ]
    });
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los pedidos.' });
  }
};

// Obtener un pedido por su id con detalles
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const pedido = await Pedido.findByPk(id, {
      include: [
        {
          model: Proveedor,
          attributes: ['razon_social', 'ruc']
        },
        {
          model: DetallePedido,
          include: [
            {
              model: Material,
              attributes: ['nombre', 'precio_unitario']
            }
          ]
        }
      ]
    });

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.status(200).json(pedido);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el pedido.' });
  }
};

// Actualizar un pedido por id
exports.update = (req, res) => {
  const id = req.params.id;

  Pedido.update(req.body, {
    where: { id_pedido: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "El Pedido fue actualizado exitosamente."
        });
      } else {
        res.send({
          message: `No se puede actualizar el Pedido con id=${id}. Tal vez el pedido no fue encontrada o el cuerpo de la solicitud está vacío.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al actualizar el Pedido con id=" + id
      });
    });
};

// Eliminar un Pedido por id
exports.delete = (req, res) => {
  const id = req.params.id;

  Pedido.destroy({
    where: { id_pedido: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "El pedido fue eliminado exitosamente!"
        });
      } else {
        res.send({
          message: `No se puede eliminar el pedido con id=${id}. Tal vez el Pedido no fue encontrado.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "No se pudo eliminar el Pedido con id=" + id
      });
    });
};

// Obtener todos los pedidos por proveedor
exports.findByProveedor = async (req, res) => {
  const { proveedorId } = req.params;

  try {
    const pedidos = await Pedido.findAll({
      where: { Proveedor_id_proveedor: proveedorId },
      include: [
        {
          model: Usuario,
          attributes: ['id_usuario'],
          include: [
            {
              model: Empresa,
              attributes: ['nombre_comercial']
            }
          ]
        },
        {
          model: DetallePedido,
          include: [
            {
              model: Material,
              attributes: ['nombre', 'precio_unitario']
            }
          ]
        }
      ]
    });
    res.status(200).json(pedidos);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al obtener los pedidos."
    });
  }
};

// Obtener todos los pedidos por empresa
exports.findByEmpresa = async (req, res) => {
  const { empresaId } = req.params;

  try {
    const pedidos = await Pedido.findAll({
      include: [
        {
          model: Usuario,
          attributes: ['id_usuario'],
          where: { Empresa_id_empresa: empresaId },
          include: [
            {
              model: Empresa,
              attributes: ['nombre_comercial']
            }
          ]
        },
        {
          model: Proveedor,
          attributes: ['razon_social']
        },
        {
          model: DetallePedido,
          include: [
            {
              model: Material,
              attributes: ['nombre', 'precio_unitario']
            }
          ]
        }
      ]
    });
    res.status(200).json(pedidos);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al obtener los pedidos."
    });
  }
};