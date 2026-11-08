import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { apiClient } from "../../../api/client"
import "./ResultPage.css"
interface ResultData {
    result_id: number
    test_code: string
    computed_scores: any
}
interface Interpretation {
    title: string
    description: string
    traits?: string
    professions?: string[]
    famous_people?: string[]
}
export const ResultPage = () => {
    const {resultId} = useParams<{resultId: string}>()
    const navigate = useNavigate()
    
    const [result, setResult] = useState<ResultData | null>(null)
    const [interpretation, setInterpretation] = useState<Interpretation | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!resultId) return
        const loadResultData = async () => {
            try {
                // 1. get test result
                const res = await apiClient.get<ResultData>(`/tests/results/${resultId}`)
                const data = res.data
                console.log("data => ", data)
                setResult(data)
                // 2. get TOP type (from test result)
                const topType = data.computed_scores.top_type || data.computed_scores.top_types?.[0] || data.computed_scores.top_directions?.[0]
                const scores = data.computed_scores.scores
                let hasPositiveInterests = true
                if (scores) {
                    const maxScore = Math.max(...Object.values(scores).map(Number))
                    if (maxScore < 0) hasPositiveInterests=false
                }
                if (!hasPositiveInterests) {
                    setInterpretation({
                        title: "Интересы не выражены",
                        description: "По результатам теста сложно выделить конкретную сферу деятельности. Возможно, вам стоит попробовать себя в разных направлениях или пройти тест еще раз, отвечая более дифференцированно.",
                        traits: "Отсутствие выраженных предпочтений",
                        professions: [],
                        famous_people: []
                    })
                    return
                }
                // 3. get interpretation file
                const interpRes = await apiClient.get(`/tests/${data.test_code}/additional/interpretations`)
                console.log(topType)
                setInterpretation(interpRes.data[topType] || null)

            } catch(err) {
                console.error(error)
                setError("Не удалось загрузить результаты")
            } finally {
                setLoading(false)
            }
        }
        loadResultData()
    }, [resultId, navigate])

    if (loading) return (<div className="text-center p-6 text-lg">Загрузка результатов ...</div>)
    if (error) return (<div className="text-center p-6 text-danger text-lg ">{error}</div>)
    if (!result) return (<div className="text-center p-6 text-lg">Результаты не найдены</div>)

    return (<>
        <div className="result-container">
            <div className="result-header">
                <p className="result-title">Результат теста: {result.test_code}</p>
                <h1 className="result-type"> {interpretation ? interpretation.title : "Результат сохранен"}</h1>
            </div>
            <div className="result-body">
                {interpretation ? (
                    <>
                        {/*1. Description*/}
                        <div className="result-section">
                            <h3 className="section-title">Описание</h3>
                            <p className="text-muted leading-relaxed">{interpretation.description}</p>
                        </div>
                        {/*2. Character traits (if Json file exists)*/}
                        {interpretation.traits && (
                            <div className="result-section">
                                <h3 className="section-title">Ваши сильные стороны</h3>
                                <p className="text-muted leading-relaxed">{interpretation.traits}</p>
                            </div>
                        )}
                        {interpretation.professions && interpretation.professions.length > 0 && (
                            <div className="result-section">
                                <h3 className="section-title">Подходящие профессии</h3>
                                <div className="professions-grid">
                                    {interpretation.professions.map((prof, i) => (
                                        <span key={i} className="profession-tag">{prof}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {interpretation.famous_people && interpretation.famous_people.length > 0 && (
                            <div className="result-section">
                                <h3 className="section-title">Известные личности, такие как вы!</h3>
                                <ul className="famous-list">
                                    {interpretation.famous_people.map((person, i) => (
                                        <li key={i} className="famous-item">{person}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                ) :(
                    <div className="text-center p-6 text-muted">
                        Для этого типа пока нет подробного описания
                    </div>
                )}
            </div>
            <div className="result-actions">
                <button className="btn-primary" onClick={() => navigate("/tests")}>Вернуться к тестам</button>
            </div>
        </div>
    </>)

    
}