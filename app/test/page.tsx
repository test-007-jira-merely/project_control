export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-500 mb-4">Тестова сторінка</h1>
      <p className="text-blue-500">Якщо ви бачите цей текст синім кольором, то стилі працюють.</p>
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <p>Цей блок повинен мати сірий фон і закруглені кути.</p>
      </div>
      <button className="mt-4 px-4 py-2 bg-black text-white rounded">Це кнопка з чорним фоном і білим текстом</button>
    </div>
  )
}
