import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import HomePage from "./components/HomePage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import PreferenceQuestionnaire from "./components/PreferenceQuestionnaire";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F6F0E4]">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/preferences" element={<PreferenceQuestionnaire />} />

          {/* Catch-all route for 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4 font-['Arvo']">
                    404 - Page Not Found
                  </h1>
                  <p className="text-gray-600 mb-8 font-['Arvo']">
                    The page you're looking for doesn't exist.
                  </p>
                  <a
                    href="/"
                    className="text-[#990001] hover:text-[#800001] font-['Arvo']"
                  >
                    Go back home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
