import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash } from "react-icons/fa";
import '../styles/forms_invoices.css';
import {
  REGEX,
  normalizarTipoIdentificacion,
  esIdentificacionValida,
  esNombreValido,
  esTelefonoValido,
  esEmailValido,
  esCodigoValido,
  esDetalleValido,
  formatearProductoParaBD,
  formatearClienteParaBD,
  getMensajeDuplicado,
  esDetalleProductoValido,
  getMensajeDetalleProductoIncorrecto
} from '../utils/validations.js';

// Lógica integrada previamente en logicanew.js
function useInvoiceLogicNew() {
  const navigate = useNavigate();

  const [numeroFactura, setNumeroFactura] = useState('Cargando...');
  const [fechaEmision, setFechaEmision] = useState(() => {
    const ahora = new Date();
    return (
      ahora.getFullYear() +
      '-' +
      String(ahora.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(ahora.getDate()).padStart(2, '0')
    );
  });

  const obtenerProximoNumero = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/facturas/proximo-numero', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNumeroFactura(data.numero);
      }
    } catch (err) {
      setNumeroFactura('FAC-0000');
    }
  };

  useEffect(() => {
    obtenerProximoNumero();
  }, []);

  // Calcular fecha local actual (no UTC)
  const today = new Date();
  const todayStr = today.getFullYear() + '-' + 
                   String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(today.getDate()).padStart(2, '0');

  const [fechaVencimiento, setFechaVencimiento] = useState(() => {
    const ahora = new Date();
    return (
      ahora.getFullYear() +
      '-' +
      String(ahora.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(ahora.getDate()).padStart(2, '0')
    );
  });

  const [identificacion, setIdentificacion] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [sugerenciasNombre, setSugerenciasNombre] = useState([]);
  const [clienteExiste, setClienteExiste] = useState(null);
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [clienteNuevoAlerta, setClienteNuevoAlerta] = useState(false);

  const [cliente, setCliente] = useState({
    id: '',
    tipo_identificacion: 'C.C.',
    nombre: '',
    correo: '',
    telefono: '',
    direccion: ''
  });
  const [clienteModificado, setClienteModificado] = useState(false);

  const getIdentificacionValidador = (tipo) => {
    switch (tipo) {
      case 'C.C.':
      case 'NIT':
      case 'C.E.':
      default:
        return { regex: /^[0-9..-]*$/, mensaje: 'caracter invalido' };
    }
  };

  const normalizarIdentificacionPorTipo = (tipoAbreviado, valor) => {
    if (!valor) return '';
    const limpio = String(valor).trim();
    const soloDigitos = limpio.replace(/[^0-9]/g, '');
    switch (tipoAbreviado) {
      case 'NIT':
      case 'C.E.':
      case 'C.C.':
      default:
        return soloDigitos;
    }
  };

  const validadores = {
    nombre: {
      regex: /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s.\-]*$/,
      mensaje: 'Caracter invalido'
    },
    telefono: {
      regex: /^[0-9]*$/,
      minLength: 7,
      mensaje: 'caracter invalido'
    },
    direccion: {
      regex: /^[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\s#\-]*$/,
      mensaje: 'caracter invalido'
    },
    correo: {
      regex: /^[^\s@]*@?[^\s@]*\.?[^\s@]*$/,
      mensaje: 'Formato de correo inválido'
    }
  };

  const validarCaracteres = (campo, valor, tipoIdentificacion = cliente.tipo_identificacion) => {
    if (!valor) {
      setErroresValidacion((prev) => ({ ...prev, [campo]: null }));
      return true;
    }

    const validador = campo === 'identificacion' ? getIdentificacionValidador(tipoIdentificacion) : validadores[campo];
    if (!validador) return true;

    const esValido = validador.regex.test(valor);
    const cumpleMinimo = !validador.minLength || valor.length >= validador.minLength || valor.length === 0;

    if (!esValido) {
      setErroresValidacion((prev) => ({ ...prev, [campo]: validador.mensaje }));
      return false;
    }

    if (campo === 'telefono' && valor && valor.length > 0 && valor.length < validador.minLength) {
      setErroresValidacion((prev) => ({ ...prev, [campo]: `Mínimo ${validador.minLength} caracteres` }));
      return false;
    }

    setErroresValidacion((prev) => ({ ...prev, [campo]: null }));
    return true;
  };

  const validarCorreo = (email) => {
    if (!email) {
      setErroresValidacion((prev) => ({ ...prev, correo: null }));
      return true;
    }
    const esValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!esValido) {
      setErroresValidacion((prev) => ({ ...prev, correo: 'Formato de correo inválido' }));
      return false;
    }
    setErroresValidacion((prev) => ({ ...prev, correo: null }));
    return true;
  };

  const verificarClientePorIdentificacion = async () => {
    const valor = identificacion.trim();
    const tipoSelAbrev = (cliente.tipo_identificacion || '').trim();
    if (!valor) {
      setClienteExiste(null);
      return;
    }
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/clientes/buscar?term=${valor}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const datos = await res.json();
        const valorNorm = normalizarIdentificacionPorTipo(tipoSelAbrev, valor);
        const coincide = datos.some(
          (c) =>
            normalizarIdentificacionPorTipo(
              normalizarTipoIdentificacion(String(c.tipo_identificacion || '')),
              String(c.identificacion || '')
            ) === valorNorm &&
            normalizarTipoIdentificacion(String(c.tipo_identificacion || '')) === tipoSelAbrev
        );
        setClienteExiste(coincide ? true : null);
      } else {
        setClienteExiste(null);
      }
    } catch (err) {
      console.error(err);
      setClienteExiste(null);
    }
  };

  const seleccionarClientePorIdentificacion = (clienteSeleccionado) => {
    setIdentificacion(clienteSeleccionado.identificacion);
    setCliente({
      id: clienteSeleccionado.id,
      tipo_identificacion: clienteSeleccionado.tipo_identificacion || 'C.C.',
      nombre: clienteSeleccionado.nombre_razon_social,
      correo: clienteSeleccionado.email,
      telefono: clienteSeleccionado.telefono,
      direccion: clienteSeleccionado.direccion
    });
    setClienteModificado(false);
    setClienteExiste(true);
    setClienteNuevoAlerta(false);
    setErroresValidacion({});
  };

  const seleccionarClientePorNombre = (clienteSeleccionado) => {
    setIdentificacion(clienteSeleccionado.identificacion);
    setCliente({
      id: clienteSeleccionado.id,
      tipo_identificacion: clienteSeleccionado.tipo_identificacion || 'C.C.',
      nombre: clienteSeleccionado.nombre_razon_social,
      correo: clienteSeleccionado.email,
      telefono: clienteSeleccionado.telefono,
      direccion: clienteSeleccionado.direccion
    });
    setClienteModificado(false);
    setClienteNuevoAlerta(false);
    setErroresValidacion({});
  };

  const autocompletarClienteConTab = (e) => {
    if (e.key === 'Tab' && clienteExiste) {
      e.preventDefault();
      // Ya el cliente existe, se puede continuar sin necesidad de autocompletar
    }
  };

  const handleIdentificacionChange = (e) => {
    const valor = e.target.value;
    validarCaracteres('identificacion', valor);
    setIdentificacion(valor);
    setClienteExiste(null);
    setClienteModificado(true);
  };

  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tipo_identificacion') {
      validarCaracteres('identificacion', identificacion, value);
      setClienteExiste(null);
    }
    if (name in validadores) {
      validarCaracteres(name, value);
    }
    if (name === 'correo') {
      validarCorreo(value);
    }
    if (name === 'nombre') {
      setClienteExiste(null);
    }
    setCliente((prev) => ({ ...prev, [name]: value }));
    setClienteModificado(true);
  };

  const validarDatosCliente = async () => {
    if (!identificacion?.trim()) {
      alert('⚠️ Identificación obligatoria.');
      return false;
    }

    if (!cliente.id && clienteModificado && clienteExiste === false) {
      const confirmarClienteNuevo = window.confirm(
        '⚠️ Cliente no existe en la base de datos.\n\n¿Desea crear un nuevo cliente con los datos ingresados?'
      );
      if (!confirmarClienteNuevo) return false;
    }

    if (!cliente.nombre?.trim()) {
      alert('⚠️ Nombre/Razón Social obligatorio.');
      return false;
    }

    if (!cliente.telefono?.trim()) {
      alert('⚠️ Teléfono obligatorio.');
      return false;
    }
    if (cliente.telefono.length < 7) {
      alert('⚠️ Teléfono: mínimo 7 caracteres.');
      return false;
    }

    if (cliente.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.correo)) {
      alert('⚠️ Correo: formato incorrecto.');
      return false;
    }

    if (Object.values(erroresValidacion).some((e) => e !== null)) {
      alert('⚠️ Hay errores de validación en los campos del cliente. Corrija los datos.');
      return false;
    }

    return true;
  };

  const guardarOActualizarCliente = async (token) => {
    try {
      const tipoNormalizado = (cliente.tipo_identificacion || '').trim().toUpperCase();
      const datos = { ...formatearClienteParaBD(cliente, identificacion), tipo_identificacion: tipoNormalizado };
      if (cliente.id) {
        const res = await fetch(`http://localhost:8080/api/clientes/${cliente.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(datos)
        });
        const data = await res.json();
        if (res.ok) {
          return cliente.id;
        } else {
          alert('❌ Error al actualizar cliente: ' + data.message);
          return null;
        }
      } else {
        const res = await fetch('http://localhost:8080/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(datos)
        });
        const data = await res.json();
        if (res.ok) {
          setCliente((prev) => ({ ...prev, id: data.cliente.id }));
          return data.cliente.id;
        } else {
          alert('❌ Error al registrar cliente: ' + data.message);
          return null;
        }
      }
    } catch (err) {
      alert('❌ Error de conexión al guardar cliente.');
      return null;
    }
  };

  const limpiarFormularioCliente = () => {
    setIdentificacion('');
    setCliente({ id: '', tipo_identificacion: 'C.C.', nombre: '', correo: '', telefono: '', direccion: '' });
    setClienteExiste(null);
    setClienteNuevoAlerta(false);
    setErroresValidacion({});
    setClienteModificado(false);
  };

  const [productosFactura, setProductosFactura] = useState([
    { producto_id: null, codigo: '', cantidad: 1, detalle: '', vUnitario: 0, descuento: 0, vTotal: 0, ivaPorcentaje: 0 }
  ]);
  const [sugerenciasProd, setSugerenciasProd] = useState([]);
  const [sugerenciasProdNombre, setSugerenciasProdNombre] = useState([]);
  const [productosNuevos, setProductosNuevos] = useState(new Set());
  const [erroresProductos, setErroresProductos] = useState([]);

  useEffect(() => {
    setErroresProductos((prev) => productosFactura.map((_, i) => prev[i] || {}));
  }, [productosFactura]);

  const buscarProductos = async (t) => {
    if (!t) {
      setSugerenciasProd([]);
      return;
    }
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/facturas/buscar-productos?q=${t}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setSugerenciasProd(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  // Búsqueda por nombre/detalle para datalist secundario
  const buscarProductosPorNombre = async (t) => {
    if (!t) {
      setSugerenciasProdNombre([]);
      return;
    }
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/facturas/buscar-productos?q=${t}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setSugerenciasProdNombre(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const esCodigoValidoLocal = (codigo) => esCodigoValido(codigo);
  const esDetalleValidoLocal = (detalle) => esDetalleValido(detalle);

  const validarCodigoDuplicado = async (codigo, excluyendoIndex = null) => {
    if (!codigo.trim()) return false;
    // Validar duplicado solo en la factura actual
    const encontradoEnFactura = productosFactura.some((prod, idx) => 
      idx !== excluyendoIndex && prod.codigo === codigo.trim() && prod.codigo
    );
    return encontradoEnFactura;
  };

  // Verificar existencia de producto por código en blur
  const verificarProductoExiste = async (index, codigo) => {
    if (!codigo?.trim()) {
      setErroresProductos((prev) => {
        const next = [...prev];
        next[index] = { ...(next[index] || {}) };
        next[index].codigo = null;
        return next;
      });
      return;
    }
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/facturas/buscar-productos?q=${codigo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const existe = data.some((p) => String(p.codigo).toLowerCase() === codigo.trim().toLowerCase());
        setErroresProductos((prev) => {
          const next = [...prev];
          next[index] = { ...(next[index] || {}) };
          next[index].codigo = existe ? null : 'Producto no existe en la base de datos';
          return next;
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const verificarProductoExistePorNombre = async (index, nombre) => {
    if (!nombre?.trim()) return;
    // Si el detalle cumple el patrón básico, no marcamos error
    const valido = esDetalleProductoValido(nombre);
    setErroresProductos((prev) => {
      const next = [...prev];
      next[index] = { ...(next[index] || {}) };
      next[index].detalle = valido ? null : 'Detalle debe ser "Nombre - Descripción"';
      return next;
    });
  };

  const handleInputChange = (index, campo, valor) => {
    const nuevos = [...productosFactura];
    const productoActual = nuevos[index];
    if (campo === 'codigo') {
      productoActual.codigo = valor;
      const productoEncontrado = sugerenciasProd.find(
        (p) => String(p.codigo).toLowerCase() === String(valor).toLowerCase()
      );
      if (productoEncontrado) {
        productoActual.codigo = productoEncontrado.codigo;
        productoActual.producto_id = productoEncontrado.id;
        productoActual.detalle =
          productoEncontrado.nombre + (productoEncontrado.descripcion ? ` - ${productoEncontrado.descripcion}` : '');
        productoActual.vUnitario = parseFloat(productoEncontrado.precio) || 0;
        productoActual.descuento = 0;
        productoActual.ivaPorcentaje = parseFloat(productoEncontrado.impuesto_porcentaje) || 0;
        const nuevosProductos = new Set(productosNuevos);
        nuevosProductos.delete(index);
        setProductosNuevos(nuevosProductos);
      } else {
        productoActual.producto_id = null;
        productoActual.detalle = '';
        productoActual.vUnitario = 0;
        productoActual.descuento = 0;
        productoActual.ivaPorcentaje = 0;
        const nuevosProductos = new Set(productosNuevos);
        nuevosProductos.delete(index);
        setProductosNuevos(nuevosProductos);
      }
    } else if (campo === 'cantidad') {
      if (valor === '') {
        productoActual.cantidad = '';
      } else {
        const num = parseFloat(valor);
        productoActual.cantidad = !isNaN(num) && num > 0 ? num : 0;
      }
    } else if (campo === 'detalle') {
      productoActual.detalle = valor;
      if (valor.trim() && !esDetalleProductoValido(valor)) {
        console.warn(`Detalle incorrecto en producto: debe ser 'Nombre - Descripción'`);
      }
    } else if (campo === 'vUnitario') {
      // V.Unitario no se permite modificar manualmente
      return;
    } else if (campo === 'descuento') {
      if (valor === '') {
        productoActual.descuento = '';
      } else {
        const num = parseFloat(valor);
        const seguro = Math.min(Math.max(isNaN(num) ? 0 : num, 0), 100);
        productoActual.descuento = seguro;
      }
    }
    // Recalcular vTotal una sola vez
    const subtotalProducto = (parseFloat(productoActual.cantidad) || 0) * (parseFloat(productoActual.vUnitario) || 0);
    const descuentoAplicado = subtotalProducto * ((parseFloat(productoActual.descuento) || 0) / 100);
    productoActual.vTotal = subtotalProducto - descuentoAplicado;
    setProductosFactura(nuevos);
  };

  const autocompletarProductoConTab = (e, index) => {
    if (e.key === 'Tab' && sugerenciasProd.length > 0) {
      e.preventDefault();
      const productoSugerido = sugerenciasProd[0];
      const nuevos = [...productosFactura];
      nuevos[index].codigo = productoSugerido.codigo;
      nuevos[index].producto_id = productoSugerido.id;
      nuevos[index].detalle =
        productoSugerido.nombre + (productoSugerido.descripcion ? ` - ${productoSugerido.descripcion}` : '');
      nuevos[index].vUnitario = parseFloat(productoSugerido.precio) || 0;
      nuevos[index].descuento = 0;
      nuevos[index].ivaPorcentaje = parseFloat(productoSugerido.impuesto_porcentaje) || 0;
      const subtotalProd = (parseFloat(nuevos[index].cantidad) || 0) * (parseFloat(nuevos[index].vUnitario) || 0);
      const descuentoProd = subtotalProd * ((parseFloat(nuevos[index].descuento) || 0) / 100);
      nuevos[index].vTotal = subtotalProd - descuentoProd;
      setProductosFactura(nuevos);
      setSugerenciasProd([]);
      const nuevosProductos = new Set(productosNuevos);
      nuevosProductos.delete(index);
      setProductosNuevos(nuevosProductos);
    }
  };

  const guardarOActualizarProducto = async (token, index) => {
    const producto = productosFactura[index];
    if (!producto.codigo?.trim() || !producto.detalle?.trim() || !producto.vUnitario) {
      return producto.producto_id || null;
    }
    try {
      const datosProducto = formatearProductoParaBD(producto);
      if (producto.producto_id) {
        const res = await fetch(`http://localhost:8080/api/productos/${producto.producto_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(datosProducto)
        });
        const data = await res.json();
        if (res.ok) {
          return producto.producto_id;
        } else {
          console.error('Error al actualizar producto:', data.message);
          return null;
        }
      } else {
        const res = await fetch('http://localhost:8080/api/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(datosProducto)
        });
        const data = await res.json();
        if (res.ok) {
          return data.id;
        } else {
          console.error('Error al crear producto:', data.message);
          return null;
        }
      }
    } catch (err) {
      console.error('Error al guardar/actualizar producto:', err.message);
      alert(`❌ Error en Producto ${index + 1}: ${err.message}`);
      return null;
    }
  };

  const subtotal = productosFactura.reduce((acc, p) => acc + (parseFloat(p.vTotal) || 0), 0);
  const iva = productosFactura.reduce(
    (acc, p) => acc + ((parseFloat(p.vTotal) || 0) * ((parseFloat(p.ivaPorcentaje) || 0) / 100)),
    0
  );
  const totalGeneral = subtotal + iva;

  const validarProductos = async () => {
    const productosConCodigo = productosFactura.filter((p) => p.codigo?.trim());
    if (productosConCodigo.length === 0) {
      alert('⚠️ Debe agregar al menos un producto.');
      return false;
    }
    for (let i = 0; i < productosFactura.length; i++) {
      const p = productosFactura[i];
      if (!p.codigo?.trim()) continue;
      if (!p.codigo?.trim()) {
        alert(`⚠️ Producto ${i + 1}: Código es obligatorio.`);
        return false;
      }
      if (!esCodigoValidoLocal(p.codigo)) {
        alert(
          `⚠️ Producto ${i + 1}: Código contiene caracteres inválidos. Solo se permiten letras, números, guiones y guiones bajos.`
        );
        return false;
      }
      if (!p.detalle?.trim()) {
        alert(`⚠️ Producto ${i + 1}: Detalle es obligatorio.`);
        return false;
      }
      if (!esDetalleProductoValido(p.detalle)) {
        alert(getMensajeDetalleProductoIncorrecto(i + 1));
        return false;
      }
      if (!esDetalleValidoLocal(p.detalle)) {
        alert(`⚠️ Producto ${i + 1}: Detalle contiene caracteres inválidos. No se permiten caracteres especiales.`);
        return false;
      }
      if (!p.vUnitario || parseFloat(p.vUnitario) <= 0) {
        alert(`⚠️ Producto ${i + 1}: Valor Unitario es obligatorio y debe ser mayor a 0.`);
        return false;
      }
      if (!p.cantidad || parseFloat(p.cantidad) <= 0) {
        alert(`⚠️ Producto ${i + 1}: Cantidad es obligatoria y debe ser mayor a 0.`);
        return false;
      }
      const duplicado = await validarCodigoDuplicado(p.codigo, i);
      if (duplicado && !p.producto_id) {
        const encontradoEnFactura = productosFactura.some((prod, idx) => idx !== i && prod.codigo === p.codigo && prod.codigo);
        if (encontradoEnFactura) {
          alert(`⚠️ Producto ${i + 1}: El código ${p.codigo} ya existe en esta factura.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!fechaVencimiento.trim()) {
      alert('⚠️ Debe especificar la fecha de vencimiento.');
      return false;
    }
    const clienteValido = await validarDatosCliente();
    if (!clienteValido) return false;
    const productosValidos = await validarProductos();
    if (!productosValidos) return false;
    const token = sessionStorage.getItem('token');
    let clienteIdActual = cliente.id;
    if (!clienteIdActual) {
      clienteIdActual = await guardarOActualizarCliente(token);
      if (!clienteIdActual) return false;
    } else {
      if (clienteModificado) {
        const actualizado = await guardarOActualizarCliente(token);
        if (!actualizado) return false;
        clienteIdActual = actualizado;
      }
    }
    const productosValidados = productosFactura.filter((p) => p.codigo?.trim());
    const hayProductosNuevos = productosValidados.some((p, idx) => productosNuevos.has(idx));
    if (hayProductosNuevos) {
      const productosNuevosNombres = productosValidados
        .filter((p, idx) => productosNuevos.has(idx))
        .map((p) => `"${p.codigo}"`)
        .join(', ');
      const confirmar = window.confirm(
        `⚠️ Los siguientes productos no existen en la base de datos: ${productosNuevosNombres}\n\n¿Deseas agregar estos productos nuevos y continuar creando la factura?`
      );
      if (!confirmar) return false;
    }
    const productosConIds = [];
    for (let i = 0; i < productosFactura.length; i++) {
      const p = productosFactura[i];
      if (!p.codigo?.trim()) continue;
      const productoId = await guardarOActualizarProducto(token, i);
      if (!productoId) {
        alert(`❌ Error al guardar el producto ${p.codigo}`);
        return false;
      }
      productosConIds.push({
        producto_id: productoId,
        cantidad: p.cantidad,
        precio: p.vUnitario,
        descuento: p.descuento || 0,
        subtotal: p.vTotal,
        ivaPorcentaje: p.ivaPorcentaje
      });
    }
    const descuentoPromedio =
      productosFactura.length > 0
        ? productosFactura.reduce((sum, p) => sum + (parseFloat(p.descuento) || 0), 0) / productosFactura.length
        : 0;
    const ahora = new Date();
    const horaExacta = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}:${String(
      ahora.getSeconds()
    ).padStart(2, '0')}`;
    const fechaFinalFactura = `${fechaEmision} ${horaExacta}`;
    try {
      const response = await fetch('http://localhost:8080/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          cliente_id: clienteIdActual,
          fecha_vencimiento: fechaVencimiento,
          fecha_creacion: fechaFinalFactura,
          subtotal: subtotal,
          iva: iva,
          total: totalGeneral,
          descuento_porcentaje: descuentoPromedio,
          productos: productosConIds
        })
      });
      if (response.ok) {
        alert('✅ Factura guardada correctamente');
        navigate('/facturas');
        return true;
      } else {
        const errorData = await response.json();
        alert('❌ Error: ' + (errorData.message || 'No se pudo guardar'));
        return false;
      }
    } catch (err) {
      alert('❌ Error de conexión');
      return false;
    }
  };

  const handleCancel = () => {
    navigate('/facturas');
  };

  return {
    numeroFactura,
    fechaEmision,
    setFechaEmision,
    fechaVencimiento,
    setFechaVencimiento,
    identificacion,
    handleIdentificacionChange,
    verificarClientePorIdentificacion,
    cliente,
    clienteExiste,
    erroresValidacion,
    handleClienteChange,
    productosFactura,
    handleInputChange,
    autocompletarProductoConTab,
    agregarFilaProducto: () =>
      setProductosFactura([
        ...productosFactura,
        { producto_id: null, codigo: '', cantidad: 1, detalle: '', vUnitario: 0, descuento: 0, vTotal: 0, ivaPorcentaje: 0 }
      ]),
    eliminarFilaProducto: (i) => {
      if (productosFactura.length > 1) {
        setProductosFactura(productosFactura.filter((_, idx) => idx !== i));
        setErroresProductos((prev) => prev.filter((_, idx) => idx !== i));
      }
    },
    buscarProductos,
    buscarProductosPorNombre,
    sugerenciasProd,
    sugerenciasProdNombre,
    erroresProductos,
    verificarProductoExiste,
    verificarProductoExistePorNombre,
    subtotal,
    iva,
    totalGeneral,
    handleSubmit
  };
}

const InvoiceNewClientForm = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate(); 
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/home/facturas');
    }
  }; 

  const { 
    fechaVencimiento,
    setFechaVencimiento,
    numeroFactura, 
    fechaEmision, 
    setFechaEmision,
    identificacion,
    handleIdentificacionChange,
    verificarClientePorIdentificacion,
    cliente,
    clienteExiste,
    erroresValidacion,
    handleClienteChange,
    productosFactura, 
    handleInputChange, 
    autocompletarProductoConTab,
    agregarFilaProducto, 
    eliminarFilaProducto,
    buscarProductos, 
    buscarProductosPorNombre,
    sugerenciasProd,
    sugerenciasProdNombre,
    erroresProductos,
    verificarProductoExiste,
    verificarProductoExistePorNombre,
    subtotal, 
    iva, 
    totalGeneral,
    handleSubmit: handleFormSubmit
  } = useInvoiceLogicNew();

  // Función para manejar submit (las validaciones y avisos están en el hook)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await handleFormSubmit(e);
    if (result === true) {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/home/facturas');
      }
    }
  };

  // Calcular fecha local actual (no UTC)
  const today = new Date();
  const todayStr = today.getFullYear() + '-' + 
                   String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(today.getDate()).padStart(2, '0');
  
  return (
    <form className="app-form card" onSubmit={handleSubmit}>
      <h2 className="module-title">Registrar Nueva Factura Cliente Nuevo</h2>

 {/*********************** N°FACTURA Y FECHA*****************************/}
    
             <div className='Subtitulo'>
                
                <div className='Numero-Fecha'>
                
                 <label className='Numero'>
                 <input type="text" value={numeroFactura} readOnly /> Número de Factura</label>
                 
                 <label className='Fecha'>
                 <input type="date" value={fechaEmision} min={todayStr} onChange={(e) => setFechaEmision(e.target.value)} /> Fecha Emisión</label>

                 <label className='Fecha'>
                 <input type="date" value={fechaVencimiento} min={todayStr} onChange={(e) => setFechaVencimiento(e.target.value)} /> Fecha Vencimiento</label>
                 
                </div>
            </div>    
                
                
{/* ******************** DATOS DEL CLIENTE *********************************** */}

<h2 className="section-title">2. Datos del Cliente</h2>


<div className="section-group">{/*Clase Global Inputs y Label Campos Detalles Clientes*/}


    <div className="client-data input">

        <label>T.DC</label>

        <select 
            name="tipo_identificacion" 
            value={cliente.tipo_identificacion} 
            onChange={handleClienteChange}
            
            className="form-select">

            <option value="C.C.">C.C.</option>
            <option value="NIT">NIT</option>
            <option value="C.E.">C.E.</option>
        </select>
    </div>


    {/* Campo de identificación con autocompletado y notificaciones */}
    <div className="client-data input">
       <label>N° Identificación</label>
        <input 
        type="text" 
        value={identificacion}
        onChange={handleIdentificacionChange}
        onBlur={verificarClientePorIdentificacion}
        placeholder="Escribe NIT, C.C. o C.E..."
        autoComplete="off"
        className={erroresValidacion.identificacion ? 'input-error' : ''}
        />

        {/* Sin sugerencias: solo notificación de existencia */}

        <div className="field-messages">
          {erroresValidacion.identificacion && (
            <span className="error-message">⚠️ {erroresValidacion.identificacion}</span>
          )}
          {clienteExiste === true && identificacion && (
            <span className="success-message" style={{ fontSize: '12px', display: 'block' }}>✅ Cliente existente</span>
          )}
        </div>
       
    </div>

    {/* Campo de nombre con autocompletado y notificaciones */}
    <div className="client-data input">
        <label>Nombre - Razón Social</label>
        <input 
        name="nombre" 
        value={cliente.nombre} 
        onChange={handleClienteChange}
        onBlur={verificarClientePorIdentificacion}
        placeholder="Nombre completo o razón social"
        autoComplete="off"
        className={erroresValidacion.nombre ? 'input-error' : ''}
        />

        {/* Sin sugerencias: solo notificación de existencia */}

        <div className="field-messages">
          {erroresValidacion.nombre && (
            <span className="error-message">⚠️ {erroresValidacion.nombre}</span>
          )}
        </div>
        
    </div>



    <div className="client-data input">
        <label>Teléfono</label>
        <input 
        name="telefono" 
        value={cliente.telefono} 
        onChange={handleClienteChange}
        placeholder="Mínimo 7 dígitos"
            autoComplete="off"
          className={erroresValidacion.telefono ? 'input-error' : ''}
        />
        <div className="field-messages">
          {erroresValidacion.telefono && (
            <span className="error-message">⚠️ {erroresValidacion.telefono}</span>
          )}
        </div>
    </div>

        
    <div className="client-data input">
        <label>Dirección</label>
        <input 
        name="direccion" 
        value={cliente.direccion} 
        onChange={handleClienteChange}
        placeholder="Calle, número, etc."
            autoComplete="off"
          className={erroresValidacion.direccion ? 'input-error' : ''}
        />
        <div className="field-messages">
          {erroresValidacion.direccion && (
            <span className="error-message">⚠️ {erroresValidacion.direccion}</span>
          )}
        </div>
    </div>


    <div className="client-data input">
        <label>Correo</label>
        <input 
        name="correo"
        type="email" 
        value={cliente.correo} 
        onChange={handleClienteChange}
        placeholder="usuario@dominio.com"
            autoComplete="off"
          className={erroresValidacion.correo ? 'input-error' : ''}
        />
        <div className="field-messages">
          {erroresValidacion.correo && (
            <span className="error-message">⚠️ {erroresValidacion.correo}</span>
          )}
        </div>
    </div>


</div>
                 

        


{/********************* DETALLES DEL PRODUCTO *********************************** */}
 <h2 className="section-title Product">3. Detalle de Productos</h2>
{/* Encabezado de la cuadrícula */}

<div className="product-grid product-header">
    <span>Código</span>
    <span>Cant.</span>
    <span>Detalle</span>
    <span>V.Unitario</span>
    <span>Desc.%</span>
    <span>V.Total</span>
    <span></span>
</div>

{productosFactura.map((prod, index) => (
    <div className="product-grid product-row" key={index}>
        {/* Código con búsqueda */}
        <div className="product-field-container">
        <input 
            type="text" 
            value={prod.codigo} 
            onChange={(e) => {
                handleInputChange(index, 'codigo', e.target.value);
                buscarProductos(e.target.value);
            }}
            onKeyDown={(e) => autocompletarProductoConTab(e, index)}
            onBlur={(e) => verificarProductoExiste(index, e.target.value)}
            list="lista-productos"
            placeholder="Código"
                        autoComplete="off"
            className={erroresProductos[index]?.codigo ? 'input-error' : ''}
        />
            <div className="field-messages">
              {erroresProductos[index]?.codigo && (
                <span className="error-message">{erroresProductos[index].codigo}</span>
              )}
            </div>
        </div>
        
        {/* Cantidad */}
        <div className="product-field-container">
        <input 
          type="number" 
            value={prod.cantidad}
            onChange={(e) => handleInputChange(index, 'cantidad', e.target.value)}
            min="1"
            placeholder="Cant."
          autoComplete="off"
            className={erroresProductos[index]?.cantidad ? 'input-error' : ''}
        />
            <div className="field-messages">
              {erroresProductos[index]?.cantidad && (
                <span className="error-message">{erroresProductos[index].cantidad}</span>
              )}
            </div>
        </div>
        
        {/* Detalle */}
        <div className="product-field-container">
        <input 
            type="text" 
            value={prod.detalle}
            onChange={(e) => {
                handleInputChange(index, 'detalle', e.target.value);
                buscarProductosPorNombre(e.target.value);
            }}
            onBlur={(e) => verificarProductoExistePorNombre(index, e.target.value)}
            list="lista-productos-nombre"
            placeholder="Detalle"
                        autoComplete="off"
            className={erroresProductos[index]?.detalle ? 'input-error' : ''}
        />
            <div className="field-messages">
              {erroresProductos[index]?.detalle && (
                <span className="error-message">{erroresProductos[index].detalle}</span>
              )}
            </div>
        </div>
        
        {/* V.Unitario */}
        <div className="product-field-container">
        <input 
            type="number" 
            value={prod.vUnitario} 
          readOnly
            placeholder="Unitario"
            autoComplete="off"
            className={erroresProductos[index]?.vUnitario ? 'input-error' : ''}
        />
            <div className="field-messages">
              {erroresProductos[index]?.vUnitario && (
                <span className="error-message">{erroresProductos[index].vUnitario}</span>
              )}
            </div>
        </div>

        {/* Descuento */}
        <div className="product-field-container">
        <input 
          type="number" 
            value={prod.descuento} 
            onChange={(e) => handleInputChange(index, 'descuento', e.target.value)}
            min="0"
            max="100"
            placeholder="%"
          autoComplete="off"
            className={erroresProductos[index]?.descuento ? 'input-error' : ''}
        />
            <div className="field-messages">
              {erroresProductos[index]?.descuento && (
                <span className="error-message">{erroresProductos[index].descuento}</span>
              )}
            </div>
        </div>

        {/* Columna V.Total */}
          {/* Columna V.Total */}
        <span className="v-total">
            ${Math.round(prod.vTotal).toLocaleString('es-CO')}
        </span>



       
       
     {/* COLUMNA DE ACCIONES */}
       <div className="action-buttons">
         {/* Botón Añadir (siempre visible o solo en la última fila) */}
         {index === productosFactura.length - 1 && (
        
          <button 
            type="button" 
            className="btn-primaryy"
            onClick={agregarFilaProducto}
            title="Añadir fila"
          >
            <FaPlus />
          </button>
            )}

          {/* Botón Eliminar (visible si hay más de una fila) */}
         {index > 0 && (
           <button 
            type="button" 
            className="delete-product"
            onClick={() => eliminarFilaProducto(index)}
            title="Eliminar fila"
          >
            <FaTrash />
             </button>
           )}
      </div>

    </div>
))}

<div className="rayita"><br></br></div>

{/* DATALIST: Debe estar FUERA del map y el ID debe ser 'lista-productos' */}
<datalist id="lista-productos">
    {sugerenciasProd.map((p) => (
        <option key={p.id} value={p.codigo}>
            {p.nombre} - ${p.precio}
        </option>
    ))}
</datalist>

{/* DATALIST para búsqueda por nombre/detalle */}
<datalist id="lista-productos-nombre">
    {sugerenciasProdNombre.map((p) => (
        <option key={p.id} value={p.nombre}>
            Código: {p.codigo} - ${p.precio}
        </option>
    ))}
</datalist>
                  

                      <div className='rayita'/>
                            
                      

                {/*******************TOTALES************************/}

                <h2 className="section-totales">4. Totales</h2>

                <div className="total-line">
                <label>Subtotal</label>
                <span>${subtotal ? Math.round(subtotal).toLocaleString('es-CO') : "0"}</span>
               </div>

               <div className="iva">
                <label>IVA (19%)</label>
               <span>${iva ? Math.round(iva).toLocaleString('es-CO') : "0"}</span>
               </div>

               <div className="total-line total-final">
               <label>Total</label>
               <span>${totalGeneral ? Math.round(totalGeneral).toLocaleString('es-CO') : "0"}</span></div>

             
      {/*********** BOTONES CREAR - CANCELAR ***********/}

       <div className="final-buttons-group">
        <button 
        type="submit" // El type="submit" ya activa el onSubmit del <form> automáticamente
        className="btn btn-success"
    >
        Crear Factura
    </button>
    
    <button 
        type="button" 
        className="btn btn-danger" 
        onClick={handleCancel}
    >
        Cancelar
    </button>
</div>

            </form>
        );
    };
    
    export default InvoiceNewClientForm;
    