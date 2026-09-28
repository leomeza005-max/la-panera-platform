import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { guardarSesion } from '../auth.storage';
import { iniciarSesion } from '../services/auth.service';

export function LoginForm() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await iniciarSesion({ correo, contrasena });
      guardarSesion(respuesta);
      navigate('/pedidos', { replace: true });
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
      <label>
        Correo electrónico
        <input
          type="email"
          value={correo}
          onChange={(evento) => setCorreo(evento.target.value)}
          autoComplete="email"
          required
        />
      </label>

      <label>
        Contraseña
        <input
          type="password"
          value={contrasena}
          onChange={(evento) => setContrasena(evento.target.value)}
          autoComplete="current-password"
          minLength={8}
          required
        />
      </label>

      {error && <p className="mensaje-error">{error}</p>}

      <button type="submit" disabled={cargando}>
        {cargando ? 'Ingresando…' : 'Iniciar sesión'}
      </button>
    </form>
  );
}
