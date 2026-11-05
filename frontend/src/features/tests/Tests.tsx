import {useNavigate} from 'react-router-dom'
import { useEffect, useState } from "react"
import { apiClient } from '../../api/client'
import "./Tests.css"
interface TestCard {
    test_code: string
    title: string
    summary: string
    time_hint: string
    is_completed: boolean
    result_id: number | null
}
export const Tests = () => {
    const [tests, setTests] = useState<TestCard[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const loadTests = async () => {
            try {
                const testsTemp = (await apiClient.get('/tests/available')).data
                if (!testsTemp) throw new Error("No available tests")
                setTests(testsTemp)
            } catch(err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        loadTests()
    }, [])

    if (loading) return <div className='text-center p-6'>Загрузка тестов...</div>
    return (
        <div className='w-full'>
            <h2 className='text-2xl font-bold mb-6 text-center'>Доступные тесты</h2>
            {tests.length === 0 ? (
                <div className='text-center text-muted'>Пока нет доступных тестов</div>
            ) : (
                <div className="tests-grid">
                    {tests.map(test => (
                        <div
                            key={test.test_code}
                            className={`test-card ${test.is_completed ? 'completed': ''}`}
                        >
                            <div className='test-card-header'>
                                <h3 className='test-title'>{test.title}</h3>
                                {test.time_hint && (
                                    <span className="test-time">{test.time_hint}</span>
                                )}
                            </div>
                            <p className='test-summary'>{test.summary}</p>
                            {test.is_completed ? (
                                <button 
                                    className="btn-result"
                                    onClick = {() => navigate(`/result/${test.result_id}`)}
                                >Результат</button>) : (
                                <button 
                                    className='btn-start'
                                    onClick = {() => navigate(`/test/${test.test_code}`)}
                                    >Пройти тест</button>)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    ); 
}
