import { useNavigate, useParams } from "react-router-dom";
import type { TestDataResponse, TestQuestion } from "./types";
import { useEffect, useState } from "react";
import { apiClient } from "../../../api/client";
import "./TestEngine.css"

export const TestEngine = () => {
    const {testCode} = useParams<{testCode: string}>();
    const navigate = useNavigate()
    
    const [questions, setQuestions] = useState<TestQuestion[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({})

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 1. Loading test's questions
    useEffect(() => {
        if (!testCode) return
        const loadQuestions = async () => {
            try {
                const response = await apiClient.get<TestDataResponse>(`/tests/${testCode}/questions`)
                const qData = response.data.data
                if (!qData || qData.length === 0) {
                    setError("В этот тесте нет вопросов.")
                    return
                }
                setQuestions(qData)
            } catch(err) {
                console.error(error)
                setError("Не удалось загрузить тесты.")
            } finally {
                setLoading(false)
            }
        }
        loadQuestions()
    }, [testCode])
    // 2. Process user answer
    const handleSelectOption = (questionId: number, optionId: number) => {
        setAnswers(prev => ({...prev, [questionId.toString()]: optionId}))
    }
    // 3. Next question
    const handleNext = () => {
        if (currentIndex < questions.length - 1){
            setCurrentIndex(prev => prev + 1)
        } else handleSubmit()
    }
    // 4. Send Results
    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const res = await apiClient.post('/tests/submit', {
                test_code: testCode,
                answers: answers
            })
            navigate(`/result/${res.data.result_id}`)
        } catch (err) {
            console.error(err)
            setError("Ошибка при сохранении результатов. Попробуйте еще раз.")
            setSubmitting(false)
        }
    }
    if (loading) return (<div className="text-center p-10 text-lg">Загрузка тестов...</div>)
    if (error) return (<div className="text-center p-10 text-danger text-lg">{error}</div>)
    if (questions.length === 0) return null

    const currentQuestion = questions[currentIndex]
    const currentAnswer = answers[currentQuestion.id.toString()]
    const isLastQuestion = currentIndex === questions.length - 1

    const progressPercent = ((currentIndex + 1) / questions.length) * 100

    return (
        <div className="engine-container">

            <div className="progress-wrapper">
                <div className="progress-text">
                    <span>Вопрос {currentIndex + 1} из {questions.length}</span>
                    <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="progress-bar-bg">
                    <div 
                        className="progress-bar-fill" 
                        style={{width: `${progressPercent}%`}}
                    ></div>
                </div>
            </div>

            <div className="question-box">
                <h2 className="question-text">
                    {currentQuestion.text || "Выберите подходящий вариант:"}
                </h2>
                <div className="options-list">
                    {currentQuestion.options.map(option => (
                        <button
                            key = {option.id}
                            onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                            className={`option-btn ${currentAnswer === option.id ? "selected" : ""}`}
                        >{option.text}</button>
                    ))}
                </div>

                <div className="engine-controls">
                    <button
                        className="btn-next"
                        onClick = {handleNext}
                        disabled={!currentAnswer || submitting}
                    >{submitting 
                        ? "Сохранение..." 
                        : isLastQuestion 
                            ? "Завершить тест" 
                            : "Следующий вопрос"}
                    </button>
                </div>
            </div>
        </div>
    )
}