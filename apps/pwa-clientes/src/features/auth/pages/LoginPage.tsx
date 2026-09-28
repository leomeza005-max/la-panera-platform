import { Navigate } from 'react-router-dom';
import { haySesion } from '../auth.storage';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  if (haySesion()) {
    return <Navigate to="/pedidos" replace />;
  }

  return (
    <main className="pagina-centrada">
      <section className="tarjeta tarjeta-login">
        <p className="marca">La Panera</p>
        <h1>Iniciar sesión</h1>
        <p>Ingresa con tu cuenta para consultar y realizar pedidos.</p>
        <LoginForm />
      </section>
    </main>
  );
}
