
export const Tests = () => {
  return (
    <div className="text-center p-8 bg-surface rounded-lg shadow-sm border max-w-2xl w-full">
      <h2 className="text-2xl font-bold mb-4">Доступные тесты</h2>
      <p className="text-muted mb-8">
        Здесь будут отображаться карточки с доступными профориентационными тестами.
      </p>
      
      <div className="center-empty-state p-10 border-2 border-dashed border-gray-300 rounded-lg text-muted">
        У вас пока нет назначенных тестов
      </div>
    </div>
  ); 
}
