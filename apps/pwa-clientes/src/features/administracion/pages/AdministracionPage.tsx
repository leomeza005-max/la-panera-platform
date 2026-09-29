
import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import {
  guardarOperadorAdmin,
  guardarSucursalAdmin,
  listarOperadoresAdmin,
  listarSucursalesAdmin,
  type FormOperador,
  type OperadorAdmin,
  type SucursalAdmin,
} from '../services/administracion.service';

type Seccion = 'sucursales' | 'operadores';

const formularioVacio: FormOperador = {
  sucursalId: 0,
  nombre: '',
  apellido1: '',
  apellido2: '',
  correo: '',
  rol: 'CAJERO',
  contrasena: '',
};

export function AdministracionPage({
  tipo,
}: {
  tipo: Seccion;
}) {
  const [sucursales, setSucursales] =
    useState<SucursalAdmin[]>([]);

  const [operadores, setOperadores] =
    useState<OperadorAdmin[]>([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Formulario de sucursales
  const [editandoSucursal, setEditandoSucursal] =
    useState<number | null>(null);

  const [nombreSucursal, setNombreSucursal] =
    useState('');

  const [direccionSucursal, setDireccionSucursal] =
    useState('');

  // Formulario de operadores
  const [editandoOperador, setEditandoOperador] =
    useState<string | null>(null);

  const [formOperador, setFormOperador] =
    useState<FormOperador>(formularioVacio);

  // ====================================
  // CONSULTAR DATOS
  // ====================================
  async function cargarDatos() {
    const [
      nuevasSucursales,
      nuevosOperadores,
    ] = await Promise.all([
      listarSucursalesAdmin(),
      listarOperadoresAdmin(),
    ]);

    setSucursales(nuevasSucursales);
    setOperadores(nuevosOperadores);
  }

  useEffect(() => {
    let activo = true;

    Promise.all([
      listarSucursalesAdmin(),
      listarOperadoresAdmin(),
    ])
      .then(([s, o]) => {
        if (activo) {
          setSucursales(s);
          setOperadores(o);
        }
      })
      .catch((e: unknown) => {
        if (activo) {
          setError(
            e instanceof Error
              ? e.message
              : 'Error al cargar datos',
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  // ====================================
  // SUCURSALES
  // ====================================
  function editarSucursal(
    sucursal: SucursalAdmin,
  ) {
    setEditandoSucursal(sucursal.sucursalId);
    setNombreSucursal(sucursal.nombre);
    setDireccionSucursal(sucursal.direccion ?? '');
    setError('');
    setMensaje('');
  }

  function nuevaSucursal() {
    setEditandoSucursal(null);
    setNombreSucursal('');
    setDireccionSucursal('');
    setError('');
    setMensaje('');
  }

  async function guardarSucursal(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      await guardarSucursalAdmin(
        editandoSucursal,
        nombreSucursal,
        direccionSucursal,
      );

      await cargarDatos();

      nuevaSucursal();

      setMensaje(
        'Sucursal guardada correctamente.',
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudo guardar',
      );
    } finally {
      setGuardando(false);
    }
  }

  // ====================================
  // OPERADORES
  // ====================================
  function editarOperador(
    operador: OperadorAdmin,
  ) {
    setEditandoOperador(operador.operadorId);

    setFormOperador({
      sucursalId: operador.sucursalId,
      nombre: operador.nombre,
      apellido1: operador.apellido1,
      apellido2: operador.apellido2 ?? '',
      correo: operador.correo,
      rol: operador.rol,
      contrasena: '',
    });

    setError('');
    setMensaje('');
  }

  function nuevoOperador() {
    setEditandoOperador(null);

    setFormOperador({
      ...formularioVacio,
      sucursalId: sucursales[0]?.sucursalId ?? 0,
    });

    setError('');
    setMensaje('');
  }

  async function guardarOperador(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      await guardarOperadorAdmin(
        editandoOperador,
        formOperador,
      );

      await cargarDatos();

      nuevoOperador();

      setMensaje(
        'Operador guardado correctamente.',
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudo guardar',
      );
    } finally {
      setGuardando(false);
    }
  }

  const titulo =
    tipo === 'sucursales'
      ? 'Sucursales'
      : 'Operadores';

  return (
    <section className="operadores-dashboard administracion-pagina">
      <p className="marca">Administración</p>

      <h1>{titulo}</h1>

      <p>
        Consulta y administra los registros
        de La Panera.
      </p>

      {cargando && (
        <p>Cargando información...</p>
      )}

      {error && (
        <p className="mensaje-error">
          {error}
        </p>
      )}

      {mensaje && (
        <p className="admin-exito">
          {mensaje}
        </p>
      )}

      {/* =============================
          ADMINISTRAR SUCURSALES
         ============================= */}
      {!cargando && tipo === 'sucursales' && (
        <>
          <div className="admin-panel">
            <h2>
              {editandoSucursal === null
                ? 'Registrar sucursal'
                : 'Editar sucursal'}
            </h2>

            <form
              className="admin-form"
              onSubmit={guardarSucursal}
            >
              <label>
                Nombre
                <input
                  required
                  maxLength={120}
                  value={nombreSucursal}
                  onChange={(e) =>
                    setNombreSucursal(e.target.value)
                  }
                />
              </label>

              <label>
                Dirección
                <input
                  maxLength={255}
                  value={direccionSucursal}
                  onChange={(e) =>
                    setDireccionSucursal(e.target.value)
                  }
                />
              </label>

              <div className="admin-acciones">
                <button
                  disabled={guardando}
                  type="submit"
                >
                  {guardando
                    ? 'Guardando...'
                    : 'Guardar sucursal'}
                </button>

                <button
                  type="button"
                  className="boton-secundario"
                  onClick={nuevaSucursal}
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>

          <div className="admin-panel">
            <h2>
              Sucursales registradas (
              {sucursales.length})
            </h2>

            <div className="admin-tabla-scroll">
              <table className="admin-tabla">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {sucursales.map((s) => (
                    <tr key={s.sucursalId}>
                      <td>{s.sucursalId}</td>
                      <td>{s.nombre}</td>
                      <td>
                        {s.direccion ||
                          'Sin dirección'}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            editarSucursal(s)
                          }
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* =============================
          ADMINISTRAR OPERADORES
         ============================= */}
      {!cargando && tipo === 'operadores' && (
        <>
          <div className="admin-panel">
            <h2>
              {editandoOperador === null
                ? 'Registrar operador'
                : 'Editar operador'}
            </h2>

            <form
              className="admin-form"
              onSubmit={guardarOperador}
            >
              <label>
                Nombre
                <input
                  required
                  value={formOperador.nombre}
                  onChange={(e) =>
                    setFormOperador((f) => ({
                      ...f,
                      nombre: e.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Primer apellido
                <input
                  required
                  value={formOperador.apellido1}
                  onChange={(e) =>
                    setFormOperador((f) => ({
                      ...f,
                      apellido1: e.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Segundo apellido
                <input
                  value={formOperador.apellido2}
                  onChange={(e) =>
                    setFormOperador((f) => ({
                      ...f,
                      apellido2: e.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Correo
                <input
                  type="email"
                  required
                  value={formOperador.correo}
                  onChange={(e) =>
                    setFormOperador((f) => ({
                      ...f,
                      correo: e.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Sucursal
                <select
                  required
                  value={
                    formOperador.sucursalId || ''
                  }
                  onChange={(e) =>
                    setFormOperador((f) => ({
                      ...f,
                      sucursalId: Number(
                        e.target.value,
                      ),
                    }))
                  }
                >
                  <option value="" disabled>
                    Selecciona una sucursal
                  </option>

                  {sucursales.map((s) => (
                    <option
                      key={s.sucursalId}
                      value={s.sucursalId}
                    >
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Rol
                <select
                  value={formOperador.rol}
                  onChange={(e) =>
                    setFormOperador((f) => ({
                      ...f,
                      rol: e.target.value as
                        FormOperador['rol'],
                    }))
                  }
                >
                  <option value="CAJERO">
                    CAJERO
                  </option>
                  <option value="ADMIN">
                    ADMIN
                  </option>
                </select>
              </label>

              <label>
                {editandoOperador === null
                  ? 'Contraseña'
                  : 'Nueva contraseña (opcional)'}

                <input
                  type="password"
                  minLength={8}
                  required={
                    editandoOperador === null
                  }
                  autoComplete="new-password"
                  value={formOperador.contrasena}
                  onChange={(e) =>
                    setFormOperador((f) => ({
                      ...f,
                      contrasena: e.target.value,
                    }))
                  }
                />
              </label>

              <div className="admin-acciones">
                <button
                  disabled={
                    guardando ||
                    sucursales.length === 0
                  }
                  type="submit"
                >
                  {guardando
                    ? 'Guardando...'
                    : 'Guardar operador'}
                </button>

                <button
                  type="button"
                  className="boton-secundario"
                  onClick={nuevoOperador}
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>

          <div className="admin-panel">
            <h2>
              Operadores registrados (
              {operadores.length})
            </h2>

            <div className="admin-tabla-scroll">
              <table className="admin-tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Sucursal</th>
                    <th>Rol</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {operadores.map((o) => (
                    <tr key={o.operadorId}>
                      <td>
                        {o.nombre} {o.apellido1}
                      </td>
                      <td>{o.correo}</td>
                      <td>{o.sucursalNombre}</td>
                      <td>{o.rol}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            editarOperador(o)
                          }
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
