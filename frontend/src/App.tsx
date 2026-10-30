
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { RegisterForm } from './features/auth/RegisterForm'
import { LoginForm } from './features/auth/LoginForm';
import { Profile } from './features/profile/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './routes/Routes';
import { Tests } from './features/tests/Tests';

const AppContent = () => {
  const {user, logout} = useAuth()
  return (
    <div className="app-layout">
      
      {/* Шапка сайта */}
      <header className="app-header">
        <Link to="/" className="text-xl font-bold text-primary" style={{ textDecoration: 'none' }}>
          Профориентация
        </Link>
      
        {/* Навигация, видна только авторизованным */}
        {user && (
          <nav className="flex gap-4 items-center">
            <NavLink 
              to="/tests" 
              className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted hover:text-primary"}
            >
              Тесты
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted hover:text-primary"}
            >
              Профиль
            </NavLink>
            <NavLink to="/login" 
              onClick={() => logout()}
              className="text-muted hover:text-primary">
              Выход
            </NavLink>
          </nav>
        )}
      </header>
      
      {/* Рабочая область */}
      <main className="app-main flex justify-center items-center pt-10">
        <Routes>
          <Route element={<PublicRoute/>}>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
          </Route>
          <Route element={<ProtectedRoute/>}>
            <Route path='/profile' element={<Profile/>}/>
            <Route path="/tests" element={<Tests />} />
          </Route>
              
          <Route path="/" element={<Navigate to="/profile" replace />} />
          {/* Страница 404 */}
          <Route path="*" element={<div className="text-center mt-10 text-xl">Страница не найдена (404)</div>} />
        </Routes>
      </main>
      
    </div>

  );

}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent/>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
