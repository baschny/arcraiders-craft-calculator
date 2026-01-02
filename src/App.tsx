import { CraftCalculator } from './components/CraftCalculator';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import './styles/main.scss';

function App() {
  return (
    <>
      <Header />
      <main className="container">
        <CraftCalculator />
      </main>
      <Footer />
    </>
  );
}

export default App;
