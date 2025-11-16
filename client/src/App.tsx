import { Route, Switch } from 'wouter';
import HomePage from './pages/HomePage';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';

function App() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col dark group/design-root overflow-x-hidden font-display bg-background-dark">
      <div className="flex min-h-screen w-full">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/:rest*">
              {() => (
                <div className="flex items-center justify-center h-screen">
                  <h1 className="text-2xl font-bold text-white">404 - Page Not Found</h1>
                </div>
              )}
            </Route>
          </Switch>
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}

export default App;
