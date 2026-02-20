import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import TicketForm from './components/TicketForm';
import StatsDashboard from './components/StatsDashboard';
import TicketList from './components/TicketList';

// A separate NavBar component to highlight the active tab
function NavBar() {
  const location = useLocation();

  return (
    <div className="navbar bg-primary/70 text-primary-content shadow-lg mb-8 px-4 sm:px-8">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost normal-case text-xl font-bold">
          Ticket System
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1 gap-2">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active bg-primary-focus' : ''}>
              Ticket Queue
            </Link>
          </li>
          <li>
            <Link to="/submit" className={location.pathname === '/submit' ? 'active bg-primary-focus' : ''}>
              Submit Ticket
            </Link>
          </li>
          <li>
            <Link to="/stats" className={location.pathname === '/stats' ? 'active bg-primary-focus' : ''}>
              Dashboard
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-200">
        
        {/* Persistent Navigation Bar */}
        <NavBar />

        {/* Page Content */}
        <div className="container mx-auto px-4 pb-12 max-w-5xl">
          <Routes>
            {/* The Ticket List is the default home page */}
            <Route path="/" element={<TicketList />} />
            
            {/* The Submit Form page */}
            <Route path="/submit" element={<TicketForm />} />
            
            {/* The Stats Dashboard page */}
            <Route path="/stats" element={
              <div className="bg-base-100 p-6 rounded-xl shadow border border-base-200">
                <StatsDashboard />
              </div>
            } />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;