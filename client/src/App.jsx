import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth, AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ConfirmProvider } from './context/ConfirmContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'
import Settings from './pages/Settings'
import Discover from './pages/Discover'
import Following from './pages/Following'
import SearchResults from './pages/SearchResults'
import Chat from './pages/Chat'
import ErrorBoundary from './components/ErrorBoundary'
import Notifications from './pages/Notifications'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import NoteDetail from './pages/NoteDetail'
import EditNote from './pages/EditNote'
import SharedNote from './pages/SharedNote'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import './App.css'

function Layout({ children }) {
  const location = useLocation()
  const isChatRoute = location.pathname === '/chat'
  
  if (isChatRoute) {
    // Chat takes full screen with its own header
    return (
      <div className="d-flex flex-column vh-100">
        <main className="flex-grow-1 overflow-hidden">
          {children}
        </main>
      </div>
    )
  }
  
  return (
    <div className="d-flex flex-column vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1 overflow-hidden">
        <div className="d-none d-lg-block border-end bg-white" style={{ width: '240px' }}>
          <Sidebar />
        </div>
        <main className="flex-grow-1 overflow-auto bg-light p-3 p-md-4 pb-5 pb-lg-3">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/shared/:token" element={<SharedNote />} />
      <Route path="/profile/:id" element={<Layout><Profile /></Layout>} />
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/feed" element={<PrivateRoute><Layout><Feed /></Layout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
      <Route path="/discover" element={<PrivateRoute><Layout><Discover /></Layout></PrivateRoute>} />
      <Route path="/following" element={<PrivateRoute><Layout><Following /></Layout></PrivateRoute>} />
      <Route path="/search" element={<PrivateRoute><Layout><SearchResults /></Layout></PrivateRoute>} />
      <Route path="/chat" element={<PrivateRoute><Layout><ErrorBoundary><Chat /></ErrorBoundary></Layout></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Layout><Notifications /></Layout></PrivateRoute>} />
      <Route path="/notes" element={<PrivateRoute><Layout><Notes /></Layout></PrivateRoute>} />
      <Route path="/notes/:id" element={<PrivateRoute><Layout><NoteDetail /></Layout></PrivateRoute>} />
      <Route path="/notes/:id/edit" element={<PrivateRoute><Layout><EditNote /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AppRoutes />
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
