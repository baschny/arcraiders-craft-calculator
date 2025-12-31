import { CraftCalculator } from './components/CraftCalculator';
import './styles/main.scss';

function App() {
  return (
    <>
      <header className="app-header">
        <h1>Arc Raiders - Craft Calculator</h1>
      </header>
      <main className="container">
        <CraftCalculator />
      </main>
    </>
  );
}

export default App;
