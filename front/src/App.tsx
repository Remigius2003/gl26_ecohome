import { Routes, Route } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import Home from './pages/Home';
import About    from './pages/profile/About';
import Contact   from './pages/profile/Contact';
import Reading   from './pages/profile/Reading';
import AIViews  from './pages/profile/AIViews';
import Skills     from './pages/profile/Skills';
import SoftSkills from './pages/profile/SoftSkills';
import Projects  from './pages/projects/Projects';
import EcoApp    from './pages/projects/EcoApp';
import Game3D    from './pages/projects/Game3D';
import Dominion  from './pages/projects/Dominion';
import Cybersec  from './pages/projects/Cybersec';
import NLU       from './pages/projects/NLU';
import Portfolio from './pages/projects/Portfolio';
import Visc      from './pages/experience/Visc';
import Pyralis   from './pages/experience/Pyralis';
import Polytech  from './pages/education/Polytech';
import Toeic     from './pages/education/Toeic';
import Info      from './pages/Info';
import NotFound  from './pages/NotFound';

export default function App() {
  return (
    <LangProvider>
      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/about"               element={<About />} />
        <Route path="/projects"            element={<Projects />} />
        <Route path="/projects/eco-app"    element={<EcoApp />} />
        <Route path="/projects/game-3d"    element={<Game3D />} />
        <Route path="/projects/dominion"   element={<Dominion />} />
        <Route path="/projects/cybersec"   element={<Cybersec />} />
        <Route path="/projects/nlu"        element={<NLU />} />
        <Route path="/projects/portfolio"  element={<Portfolio />} />
        <Route path="/experience/visc"     element={<Visc />} />
        <Route path="/experience/pyralis"  element={<Pyralis />} />
        <Route path="/education/polytech"  element={<Polytech />} />
        <Route path="/education/toeic"     element={<Toeic />} />
        <Route path="/contact"             element={<Contact />} />
        <Route path="/reading"             element={<Reading />} />
        <Route path="/ai-views"            element={<AIViews />} />
        <Route path="/skills"              element={<Skills />} />
        <Route path="/soft-skills"         element={<SoftSkills />} />
        <Route path="/info"                element={<Info />} />
        <Route path="*"                    element={<NotFound />} />
      </Routes>
    </LangProvider>
  );
}
