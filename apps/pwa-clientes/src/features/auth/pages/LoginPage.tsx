import { Navigate } from 'react-router-dom';
import { obtenerTipoUsuario } from '../auth.storage';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const tipoUsuario = obtenerTipoUsuario();

  if (tipoUsuario) {
    return (
      <Navigate
        to={
          tipoUsuario === 'CLIENTE'
            ? '/pedidos'
            : '/operador'
        }
        replace
      />
    );
  }

  return (
    <main className="pagina-centrada">
      <section className="tarjeta tarjeta-login">
        <p className="marca">La Panera</p>
        <h1>Iniciar sesión</h1>

        <p>
          Selecciona el tipo de cuenta con el que deseas ingresar.
        </p>

        <LoginForm />
      </section>
    </main>
  );
}