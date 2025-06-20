import ChartEditor from './ChartEditor'

function App() {
  return (
    <div className="relative">
      <nav className="fixed top-0 h-12 w-full bg-neutral-900">
        <h2 className="text-xl">Chart Editor</h2>
      </nav>

      <div className="mt-12">
        <ChartEditor />
      </div>
    </div>
  )
}

export default App
