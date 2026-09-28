import { useState, type FormEvent } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  guardarSesion,
  haySesion,
} from '../auth.storage';
import { iniciarSesion } from '../services/auth.service';

export function LoginOperadorPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (haySesion()) {
    return <Navigate to="/panel" replace />;
  }

  async function manejarEnvio(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    setError('');
    setEnviando(true);

    try {
      const respuesta = await iniciarSesion({
        correo,
        contrasena,
      });

      guardarSesion(respuesta);

      const estado = location.state as
        | { from?: string }
        | null;

      navigate(estado?.from || '/panel', {
        replace: true,
      });
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : 'No fue posible iniciar sesión',
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pagina-centrada">
      <section className="tarjeta tarjeta-login">
        <p className="marca">La Panera</p>

        <h1>Panel de operadores</h1>

        <p>
          Ingresa con la cuenta asignada a tu sucursal.
        </p>

        <form
          className="formulario"
          onSubmit={manejarEnvio}
        >
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

          <button type="submit" disabled={enviando}>
            {enviando
              ? 'Ingresando…'
              : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </main>
  );
}