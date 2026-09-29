import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { guardarSesion } from '../auth.storage';
import {
  iniciarSesionCliente,
  iniciarSesionOperador,
} from '../services/auth.service';
import type { TipoAcceso } from '../types/auth.types';

export function LoginForm() {
  const navigate = useNavigate();

  const [tipoAcceso, setTipoAcceso] =
    useState<TipoAcceso>('CLIENTE');

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();
    setError('');
    setCargando(true);

    try {
      const credenciales = {
        correo: correo.trim(),
        contrasena,
      };

      if (tipoAcceso === 'CLIENTE') {
        const respuesta =
          await iniciarSesionCliente(credenciales);

        guardarSesion(respuesta);
        navigate('/pedidos', { replace: true });
      } else {
        const respuesta =
          await iniciarSesionOperador(credenciales);

        guardarSesion(respuesta);
        navigate('/operador', { replace: true });
      }
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : 'No fue posible iniciar sesión',
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <div
        className="selector-acceso"
        role="group"
        aria-label="Tipo de acceso"
      >
        <button
          type="button"
          className={
            tipoAcceso === 'CLIENTE'
              ? 'selector-acceso-opcion activo'
              : 'selector-acceso-opcion'
          }
          onClick={() => setTipoAcceso('CLIENTE')}
          disabled={cargando}
        >
          Cliente
        </button>

        <button
          type="button"
          className={
            tipoAcceso === 'PERSONAL'
              ? 'selector-acceso-opcion activo'
              : 'selector-acceso-opcion'
          }
          onClick={() => setTipoAcceso('PERSONAL')}
          disabled={cargando}
        >
          Personal
        </button>
      </div>

      <p className="tipo-acceso-descripcion">
        {tipoAcceso === 'CLIENTE'
          ? 'Consulta y realiza tus pedidos.'
          : 'Acceso para cajeros y administradores.'}
      </p>

      <label>
        Correo electrónico
        <input
          type="email"
          value={correo}
          onChange={(evento) =>
            setCorreo(evento.target.value)
          }
          autoComplete="email"
          required
        />
      </label>

      <label>
        Contraseña
        <input
          type="password"
          value={contrasena}
          onChange={(evento) =>
            setContrasena(evento.target.value)
          }
          autoComplete="current-password"
          minLength={8}
          required
        />
      </label>

      {error && (
        <p className="mensaje-error">{error}</p>
      )}

      <button type="submit" disabled={cargando}>
        {cargando
          ? 'Ingresando…'
          : tipoAcceso === 'CLIENTE'
            ? 'Ingresar como cliente'
            : 'Ingresar como personal'}
      </button>
    </form>
  );
}