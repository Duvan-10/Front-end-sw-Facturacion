// Users.jsx
import React, { useState, useRef, useEffect } from "react";
import "../../styles/users.css";
import { FiEye, FiEyeOff, FiEdit, FiTrash2 } from "react-icons/fi";

export default function Users() {
  const [rows, setRows] = useState([
    {
      nit: "123456789",
      nombre: "Juan Pérez",
      correo: "juan.perez@email.com",
      rol: "Administrador",
      password: "secreto123",
      visible: false, // visibilidad de la contraseña en la tabla
    },
  ]);

  const [filter, setFilter] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    nit: "",
    nombre: "",
    correo: "",
    rol: "Usuario",
    password: "",
  });

  const nitRef = useRef(null);
  const passwordRef = useRef(null);
  const [formPasswordVisible, setFormPasswordVisible] = useState(false);

  useEffect(() => {
    if (modalVisible) {
      setTimeout(() => nitRef.current && nitRef.current.focus(), 120);
    }
  }, [modalVisible]);

  const openCreate = () => {
    setEditingIndex(null);
    setForm({ nit: "", nombre: "", correo: "", rol: "Usuario", password: "" });
    setFormPasswordVisible(false);
    setModalVisible(true);
  };

  const openEdit = (index) => {
    const r = rows[index];
    setEditingIndex(index);
    setForm({ nit: r.nit, nombre: r.nombre, correo: r.correo, rol: r.rol, password: "" });
    setFormPasswordVisible(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingIndex(null);
    setForm({ nit: "", nombre: "", correo: "", rol: "Usuario", password: "" });
    setFormPasswordVisible(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (editingIndex !== null) {
      setRows((prev) => {
        const copy = [...prev];
        copy[editingIndex] = {
          ...copy[editingIndex],
          nit: payload.nit,
          nombre: payload.nombre,
          correo: payload.correo,
          rol: payload.rol,
          // si se ingresó nueva contraseña, actualizarla
          password: payload.password ? payload.password : copy[editingIndex].password,
        };
        return copy;
      });
    } else {
      setRows((prev) => [...prev, { ...payload, visible: false }]);
    }
    closeModal();
  };

  const handleDelete = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTablePassword = (index) => {
    setRows((prev) => {
      const copy = prev.map((r, i) => (i === index ? { ...r, visible: !r.visible } : r));
      return copy;
    });
  };

  const handleFormEye = () => {
    setFormPasswordVisible((v) => !v);
    if (passwordRef.current) {
      passwordRef.current.type = passwordRef.current.type === "password" ? "text" : "password";
    }
  };

  const filteredRows = rows.filter((r) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (
      r.nit.toLowerCase().includes(q) ||
      r.nombre.toLowerCase().includes(q) ||
      r.correo.toLowerCase().includes(q)
    );
  });

  const escape = (s) => s;

  return (
    <div className="user-management">
      <h2>Gestión de Usuarios</h2>

      <div className="actions">
        <button id="btnCrear" className="btn-primary" onClick={openCreate}>
          ➕ Crear Usuario
        </button>
        <input
          id="filtro"
          type="text"
          placeholder="Filtrar por Nit/Cc, nombre o correo"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <table className="user-table" id="tablaUsuarios">
        <thead>
          <tr>
            <th>Nit/Cc</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Contraseña</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((r, idx) => (
            <tr key={idx}>
              <td>{escape(r.nit)}</td>
              <td>{escape(r.nombre)}</td>
              <td>{escape(r.correo)}</td>
              <td>{escape(r.rol)}</td>
              <td className="password-cell">
                <span className="password">{r.visible ? escape(r.password) : "********"}</span>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={r.visible ? "Ocultar contraseña" : "Ver contraseña"}
                  onClick={() => toggleTablePassword(idx)}
                >
                  {r.visible ? <FiEyeOff /> : <FiEye />}
                </button>
              </td>
              <td>
                <button className="editar btn-warning" onClick={() => openEdit(idx)}>
                  <FiEdit style={{ verticalAlign: "middle" }} /> <span className="sr-only">Editar</span>
                </button>
                <button className="eliminar btn-danger" onClick={() => handleDelete(idx)}>
                  <FiTrash2 style={{ verticalAlign: "middle" }} /> <span className="sr-only">Eliminar</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      <div id="modal" className={`modal ${modalVisible ? "visible" : ""}`} aria-hidden={!modalVisible}>
        <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <button id="cerrarModal" className="close" aria-label="Cerrar" onClick={closeModal}>
            &times;
          </button>
          <h3 id="modalTitle">{editingIndex !== null ? "Editar Usuario" : "Formulario Usuario"}</h3>

          <form id="formUsuario" autoComplete="off" onSubmit={handleSubmit}>
            <label htmlFor="nit">Nit/Cc</label>
            <input
              id="nit"
              ref={nitRef}
              type="text"
              value={form.nit}
              onChange={(e) => setForm({ ...form, nit: e.target.value })}
              required
            />

            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />

            <label htmlFor="correo">Correo</label>
            <input
              id="correo"
              type="email"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              required
            />

            <label htmlFor="rol">Rol</label>
            <select id="rol" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
              <option>Usuario</option>
              <option>Administrador</option>
            </select>

            <label htmlFor="password">Contraseña</label>
            <div className="password-input">
              <input
                id="password"
                ref={passwordRef}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="icon-button"
                aria-label={formPasswordVisible ? "Ocultar contraseña" : "Ver contraseña"}
                onClick={handleFormEye}
              >
                {formPasswordVisible ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-success">
                Guardar
              </button>
              <button type="button" id="cancelar" className="btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
