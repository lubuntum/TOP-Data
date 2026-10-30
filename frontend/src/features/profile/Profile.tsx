
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./Profile.css"

export const Profile = () => {
    const {user, logout} = useAuth()
    const navigate = useNavigate()
    
    

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    if (!user) return null
    return (
        <div className="profile-card">
            <div className="profile-header">
                <div className="profile-title">
                    <h2>Личный кабинет</h2>
                    <p>Данные участника тестирования</p>
                </div>
                <button onClick={handleLogout} className="btn-logout">
                    Выйти
                </button>
            </div>

        <div className="profile-body">
            <div className="info-row">
                <div className="info-label">ФИО ребенка</div>
                <div className="info-value">{user.child_full_name}</div>
            </div>
            
            <div className="info-row">
                <div className="info-label">Школа и класс</div>
                <div className="info-value">
                    №{user.school_number}, {user.class_number}{user.class_label} класс
                </div>
            </div>

            <div className="info-row">
                <div className="info-label">ФИО родителя</div>
                <div className="info-value">{user.parent_full_name}</div>
            </div>

            <div className="info-row">
                <div className="info-label">Логин для входа</div>
                <div className="info-value">{user.login}</div>
            </div>
        </div>
        </div>
    )
}