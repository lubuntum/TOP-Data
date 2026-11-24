
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { RegisterForm } from './features/auth/RegisterForm'
import { LoginForm } from './features/auth/LoginForm';
import { Profile } from './features/profile/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminPublicRoute, AdminRoute, ProtectedRoute, PublicRoute } from './routes/Routes';
import { Tests } from './features/tests/Tests';
import { TestEngine } from './features/tests/engine/TestEngine';
import { ResultPage } from './features/tests/results/ResultPage';
import { useState } from 'react';
import { LogoSwitcher } from './components/LogoSwitcher';
import { ResetPasswordForm } from './features/auth/ResetPasswordForm';
import { AdminPanel } from './features/admin/AdminPanel';

const AppContent = () => {
  const {user, isAdmin, logout} = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  const closeMenu = () => setIsMenuOpen(false)
  return (
    <div className="app-layout">
      
      {/* Шапка сайта */}
      <header className="app-header">
        <div className='header-brand'>

          <LogoSwitcher/>
          <Link to="/" className="text-xl font-bold text-primary" style={{ textDecoration: 'none' }}>
            Профориентация
          </Link>
          
        </div>
      
        {/* Навигация, видна только авторизованным */}
        {user && (
          <>
            {/*Кнопка гамбургер для мобилок*/}
            <button
              className='mobile-menu-btn'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label='Открыть меню'
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
            {/*Меню навигации*/}
            <nav className={`app-nav ${isMenuOpen ? 'open' : ''}`}>
              <NavLink 
                to="/tests" 
                className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted hover:text-primary"}
                onClick={closeMenu}
              >
                Тесты
              </NavLink>
              <NavLink 
                to="/profile" 
                className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted hover:text-primary"}
                onClick={closeMenu}
              >
                Профиль
              </NavLink>
              <NavLink to="/login" 
                onClick={() => logout()}
                className="text-muted hover:text-primary">
                Выход
              </NavLink>
            </nav>
          </>
        )}
        {isAdmin && (
          <>
            <button
              className='mobile-menu-btn'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label='Открыть меню'>
              {isMenuOpen ? '✕' : '☰'}
            </button>
            <nav className={`app-nav ${isMenuOpen ? 'open' : ''}`}>
              <NavLink 
                to="/admin/login"
                onClick={() => logout() }
                className="text-muted hover:text-primary">
                Выход
              </NavLink>
            </nav>
          </>
        )}
      </header>
      
      {/* Рабочая область */}
      <main className="app-main flex justify-center items-center pt-10">
        <Routes>
          {/**For anyone */}
          <Route element={<PublicRoute/>}>
            <Route path="/login" element={<LoginForm loginUrl={'/auth/login'} navigateUrl='/profile' />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/reset-password" element={<ResetPasswordForm/>} />
          </Route>
          {/*For authorised users*/}
          <Route element={<ProtectedRoute/>}>
            <Route path='/profile' element={<Profile/>}/>
            <Route path="/tests" element={<Tests />} />
            <Route path='/test/:testCode' element={<TestEngine/>} />
            <Route path='/result/:resultId' element={<ResultPage/>} />
          </Route>
          {/*Admin enter*/}
          <Route element={<AdminPublicRoute />}>
            <Route path='/admin/login' element={<LoginForm loginUrl={'/admin/login'} navigateUrl={'/admin/panel'} />} />
          </Route>
          {/* Only for admin*/}
          <Route element={<AdminRoute/>}>
            <Route path='/admin/panel' element={<AdminPanel/>} />
          </Route>
              
          <Route path="/" element={<Navigate to="/profile" replace />} />
          {/* Страница 404 */}
          <Route path="*" element={<div className="text-center mt-10 text-xl">Страница не найдена (404)</div>} />
        </Routes>
      </main>
      <footer className='app-footer text-muted'>
        <div className='container footer-content'>
          <div className='footer-section'>
            <p className="font-medium text-main mb-1">Профориентационное тестирование проводится "АНО ПОО ММКЦТ "Академия ТОП" в рамках образовательной программы по профессиональной ориентации школьников. </p>
          </div>
          <div className='footer-section'>
            <p className='font-medium text-main mb-1'>По результатам обращаться</p>
            <p>
              <a href="mailto:abakan@top-academy.ru">abakan@top-academy.ru</a>
              <span className='mx-2'>.</span>
              <a href="tel:73902215354">+7 (390) 221-53-54</a>
            </p>
          </div>

          <div className='footer-section'>
            <p className="font-medium text-main mb-1">Дизайн и разработка</p>
            <p>
              <a href="mailto:lubuntum@gmail.com">lubuntum@gmail.com</a>
              <span className='mx-2'>.</span>
            </p>
          </div>
        </div>
      </footer>
      
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
