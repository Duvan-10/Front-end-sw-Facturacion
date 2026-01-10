// Users.jsx
import React, { useState, useRef, useEffect } from "react";
import "../styles/users.css";
import { FiEye, FiEyeOff, FiEdit, FiTrash2 } from "react-icons/fi";
import { API_URL } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Users() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    nit: "",
    nombre: "",
    correo: "",
    rol: "user",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const nitRef = useRef(null);
  const passwordRef = useRef(null);
  const [formPasswordVisible, setFormPasswordVisible] = useState(false);

  // Constantes para validación
  const MAX_DIGITS = 10;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.-]+$/;
  const identificationRegex = /^[0-9]+$/;

  useEffect(() => {
    // Verificar que el usuario sea admin antes de cargar
    if (!user || user.role !== 'admin') {
      setError("Acceso denegado. Solo los administradores pueden gestionar usuarios.");
      return;
    }
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (modalVisible) {
      setTimeout(() => nitRef.current && nitRef.current.focus(), 120);
    }
  }, [modalVisible]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem("token");
      
      if (!token) {
        setError("No se encontró token de autenticación. Por favor, inicia sesión nuevamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cargar usuarios");
      }

      const data = await response.json();
      const formattedUsers = data.users.map(user => ({
        id: user.id,
        nit: user.identification,
        nombre: user.name,
        correo: user.email,
        rol: user.role === "admin" ? "Administrador" : "Usuario",
        roleValue: user.role,
      }));
      setRows(formattedUsers);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm({ nit: "", nombre: "", correo: "", rol: "user", password: "", confirmPassword: "" });
    setFormPasswordVisible(false);
    setFormErrors({});
    setModalVisible(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ 
      nit: user.nit, 
      nombre: user.nombre, 
      correo: user.correo, 
      rol: user.roleValue,
      password: "",
      confirmPassword: "" 
    });
    setFormPasswordVisible(false);
    setFormErrors({});
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingUser(null);
    setForm({ nit: "", nombre: "", correo: "", rol: "user", password: "", confirmPassword: "" });
    setFormPasswordVisible(false);
    setFormErrors({});
    setError(null);
  };

  // Función de validación de campo individual
  const validateField = (fieldName, value) => {
    if (!value || !value.trim()) {
      // Permitir password vacío en edición
      if (fieldName === 'password' && editingUser) return null;
      if (fieldName === 'confirmPassword' && editingUser && !form.password) return null;
      return 'Este campo es obligatorio.';
    }
    
    switch (fieldName) {
      case 'nit':
        if (!identificationRegex.test(value)) return 'Solo se permiten números.';
        if (value.length > MAX_DIGITS) return `Máximo ${MAX_DIGITS} dígitos.`;
        break;
      case 'nombre':
        if (!nameRegex.test(value)) return 'Solo letras, espacios, puntos y guiones.';
        break;
      case 'correo':
        if (!emailRegex.test(value)) return 'Formato de correo inválido.';
        break;
      case 'password':
        if (value.length < 6) return 'Mínimo 6 caracteres.';
        break;
      case 'confirmPassword':
        if (value !== form.password) return 'Las contraseñas no coinciden.';
        break;
      default:
        break;
    }
    return null;
  };

  // Manejo de cambios en inputs
  const handleInputChange = (fieldName, value) => {
    setForm(prev => ({ ...prev, [fieldName]: value }));

    // Limpia el mensaje global de error
    if (error) setError(null);

    setFormErrors(prev => {
      const newErrors = { ...prev };
      
      // Validación inmediata para impedir caracteres inválidos
      if (fieldName === 'nit' && value && !identificationRegex.test(value)) {
        newErrors.nit = 'Solo se permiten números.';
      } else if (fieldName === 'nombre' && value && !nameRegex.test(value)) {
        newErrors.nombre = 'Solo letras, espacios, puntos y guiones.';
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
  };

  // Validación al perder foco
  const handleBlur = (fieldName) => {
    const error = validateField(fieldName, form[fieldName]);
    setFormErrors(prev => {
      const newErrors = { ...prev };
      if (error) newErrors[fieldName] = error;
      else delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validar todos los campos
    const fields = editingUser 
      ? { nit: form.nit, nombre: form.nombre, correo: form.correo, rol: form.rol }
      : { nit: form.nit, nombre: form.nombre, correo: form.correo, rol: form.rol, password: form.password, confirmPassword: form.confirmPassword };
    
    const newErrors = {};
    Object.keys(fields).forEach(key => {
      const error = validateField(key, fields[key]);
      if (error) newErrors[key] = error;
    });

    // Si estamos editando y hay contraseña, validarla
    if (editingUser && form.password) {
      const passwordError = validateField('password', form.password);
      if (passwordError) newErrors.password = passwordError;
      const confirmError = validateField('confirmPassword', form.confirmPassword);
      if (confirmError) newErrors.confirmPassword = confirmError;
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setError('Por favor, corrige los errores del formulario.');
      setLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      
      if (!token) {
        setError("No se encontró token de autenticación. Por favor, inicia sesión nuevamente.");
        navigate("/login");
        return;
      }

      const payload = {
        identification: form.nit,
        name: form.nombre,
        email: form.correo,
        role: form.rol,
      };

      if (form.password) {
        payload.password = form.password;
      }

      let response;
      if (editingUser) {
        response = await fetch(`${API_URL}/users/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar usuario");
      }

      await fetchUsers();
      closeModal();
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Estás seguro de eliminar al usuario ${user.nombre}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem("token");
      
      if (!token) {
        setError("No se encontró token de autenticación. Por favor, inicia sesión nuevamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar usuario");
      }

      await fetchUsers();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormEye = () => {
    setFormPasswordVisible((v) => !v);
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

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Solo mostrar controles si es admin */}
      {user && user.role === 'admin' ? (
        <>
          <div className="actions">
            <button id="btnCrear" className="btn-primary" onClick={openCreate} disabled={loading}>
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

          {loading && <p>Cargando...</p>}

          <table className="user-table" id="tablaUsuarios">
            <thead>
              <tr>
                <th>Nit/Cc</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
              
            </thead>
            <tbody>
              {filteredRows.map((r, idx) => (
                <tr key={r.id || idx}>
                  <td>{escape(r.nit)}</td>
                  <td>{escape(r.nombre)}</td>
                  <td>{escape(r.correo)}</td>
                  <td>{escape(r.rol)}</td>
                  
                  <td>
                    <button className="editar btn-warning" onClick={() => openEdit(r)} disabled={loading} title="Editar usuario">
                      <FiEdit className="action-icon" /> <span className="sr-only">Editar</span>
                    </button>
                    <button className="eliminar btn-danger" onClick={() => handleDelete(r)} disabled={loading} title="Eliminar usuario">
                      <FiTrash2 className="action-icon" /> <span className="sr-only">Eliminar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div className="access-denied">
          <p>Acceso denegado. Solo los administradores pueden gestionar usuarios.</p>
        </div>
      )}

      {/* Modal */}
      <div id="modal" className={`modal ${modalVisible ? "visible" : ""}`} aria-hidden={!modalVisible}>
        <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <button id="cerrarModal" className="close" aria-label="Cerrar" onClick={closeModal}>
            &times;
          </button>
          <h3 id="modalTitle">{editingUser ? "Editar Usuario" : "Formulario Usuario"}</h3>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form id="formUsuario" autoComplete="off" onSubmit={handleSubmit}>
            <label htmlFor="nit">Nit/Cc</label>
            <input
              id="nit"
              ref={nitRef}
              type="text"
              name="nit"
              value={form.nit}
              maxLength={MAX_DIGITS}
              onChange={(e) => handleInputChange('nit', e.target.value)}
              onBlur={() => handleBlur('nit')}
              className={formErrors.nit ? 'input-error' : ''}
              placeholder="Número de identificación"
              required
            />
            {formErrors.nit && <p className="help error">{formErrors.nit}</p>}

            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              onBlur={() => handleBlur('nombre')}
              className={formErrors.nombre ? 'input-error' : ''}
              placeholder="Nombre completo"
              required
            />
            {formErrors.nombre && <p className="help error">{formErrors.nombre}</p>}

            <label htmlFor="correo">Correo</label>
            <input
              id="correo"
              type="email"
              name="correo"
              value={form.correo}
              onChange={(e) => handleInputChange('correo', e.target.value)}
              onBlur={() => handleBlur('correo')}
              className={formErrors.correo ? 'input-error' : ''}
              placeholder="correo@ejemplo.com"
              required
            />
            {formErrors.correo && <p className="help error">{formErrors.correo}</p>}

            <label htmlFor="rol">Rol</label>
            <select 
              id="rol" 
              name="rol"
              value={form.rol} 
              onChange={(e) => handleInputChange('rol', e.target.value)}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>

            <label htmlFor="password">
              Contraseña {editingUser && "(dejar en blanco para no cambiar)"}
            </label>

            <div className="password-input">
              <input
                id="password"
                ref={passwordRef}
                type={formPasswordVisible ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={formErrors.password ? 'input-error' : ''}
                placeholder="••••••••"
                required={!editingUser}
              />
              <button
                type="button"
                className="icon-button form-eye"
                aria-label={formPasswordVisible ? "Ocultar contraseña" : "Ver contraseña"}
                onClick={handleFormEye}
              >
                {formPasswordVisible ? <FiEyeOff /> : <FiEye />}
              </button>
              
            </div>
            {formErrors.password && <p className="help error">{formErrors.password}</p>}

            {!editingUser && (
              <>
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <div className="password-input">
                  <input
                    id="confirmPassword"
                    type={formPasswordVisible ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={formErrors.confirmPassword ? 'input-error' : ''}
                    placeholder="Repite la contraseña"
                    required
                  />
                </div>
                {formErrors.confirmPassword && <p className="help error">{formErrors.confirmPassword}</p>}
              </>
            )}

            {editingUser && form.password && (
              <>
                <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                <div className="password-input">
                  <input
                    id="confirmPassword"
                    type={formPasswordVisible ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={formErrors.confirmPassword ? 'input-error' : ''}
                    placeholder="Repite la nueva contraseña"
                    required
                  />
                </div>
                {formErrors.confirmPassword && <p className="help error">{formErrors.confirmPassword}</p>}
              </>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-success" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
              <button type="button" id="cancelar" className="btn-secondary" onClick={closeModal} disabled={loading}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
