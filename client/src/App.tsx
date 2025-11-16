import { useState } from 'react';
import { Route, Switch } from 'wouter';
import HomePage from './pages/HomePage';
import FortunePage from './pages/FortunePage';
import ImagePage from './pages/ImagePage';
import EntertainmentPage from './pages/EntertainmentPage';
import HealthPage from './pages/HealthPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import MyResultsPage from './pages/MyResultsPage';
import BuyCreditsPage from './pages/BuyCreditsPage';
import HelpPage from './pages/HelpPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col dark group/design-root overflow-x-hidden font-display bg-background-dark">
      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 w-full">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/signup" component={SignupPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/my-results" component={MyResultsPage} />
            <Route path="/buy-credits" component={BuyCreditsPage} />
            <Route path="/help" component={HelpPage} />
            <Route path="/fortune" component={FortunePage} />
            <Route path="/image" component={ImagePage} />
            <Route path="/entertainment" component={EntertainmentPage} />
            <Route path="/health" component={HealthPage} />
            <Route path="/:rest*">
              {() => (
                <div className="flex items-center justify-center h-screen">
                  <h1 className="text-2xl font-bold text-white">404 - Page Not Found</h1>
                </div>
              )}
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}

export default App;
