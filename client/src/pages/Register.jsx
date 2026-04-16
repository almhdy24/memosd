import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      toast.showError('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      toast.showError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.showError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password)
      toast.showSuccess('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.showError(err.message || 'Registration failed')
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
                  <i className="bi bi-person-plus fs-1 text-primary"></i>
                  <h3 className="mt-2 fw-semibold">Create account</h3>
                  <p className="text-secondary small">Join MemoSD and start sharing</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full name</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3 py-2" 
                      placeholder="Enter your name"
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                      autoFocus
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email</label>
                    <input 
                      type="email" 
                      className="form-control rounded-3 py-2" 
                      placeholder="Enter your email"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Password</label>
                    <div className="input-group">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        className="form-control rounded-start-3 py-2" 
                        placeholder="At least 6 characters"
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
                  <div className="mb-4">
                    <label className="form-label small fw-semibold">Confirm password</label>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      className="form-control rounded-3 py-2" 
                      placeholder="Re-enter your password"
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-2 rounded-3 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                    Sign Up
                  </button>
                </form>
                
                <p className="text-center text-secondary small mt-4 mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary text-decoration-none fw-semibold">Sign in</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
