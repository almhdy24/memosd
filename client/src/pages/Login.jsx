import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.showError('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      toast.showSuccess('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.showError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center py-4 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <i className="bi bi-journal-bookmark-fill fs-1 text-primary"></i>
                  <h3 className="mt-2 fw-semibold">Welcome back</h3>
                  <p className="text-secondary small">Sign in to continue to MemoSD</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email</label>
                    <input 
                      type="email" 
                      className="form-control rounded-3 py-2" 
                      placeholder="Enter your email"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      autoFocus
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Password</label>
                    <div className="input-group">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        className="form-control rounded-start-3 py-2" 
                        placeholder="Enter your password"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                      />
                      <button 
                        type="button"
                        className="btn btn-outline-secondary rounded-end-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </button>
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-2 rounded-3 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                    Sign In
                  </button>
                </form>
                
                <p className="text-center text-secondary small mt-4 mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary text-decoration-none fw-semibold">Sign up</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
