import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

export default function Landing() {
  const heroRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate__fadeInUp')
          }
        })
      },
      { threshold: 0.1 }
    )
    if (heroRef.current) observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="container py-5" ref={heroRef}>
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3">
                <i className="bi bi-journal-bookmark-fill fs-1 text-primary"></i>
              </div>
              <h1 className="display-5 fw-bold mb-0" style={{ color: '#2A6F97' }}>MemoSD</h1>
            </div>
            <p className="lead text-secondary mb-4">
              Your social notebook — capture ideas, share knowledge, and connect with learners across Sudan.
            </p>
            <div className="d-flex gap-3 flex-wrap mb-4">
              <Link to="/register" className="btn btn-primary btn-lg px-4 py-3 rounded-4 fw-semibold shadow-sm">
                Get Started <i className="bi bi-arrow-right ms-2"></i>
              </Link>
              <Link to="/login" className="btn btn-outline-primary btn-lg px-4 py-3 rounded-4 fw-semibold">
                Sign In
              </Link>
            </div>
            <div className="d-flex align-items-center gap-3 text-secondary small">
              <span><i className="bi bi-shield-check me-1"></i>Secure</span>
              <span><i className="bi bi-phone me-1"></i>Mobile ready</span>
              <span><i className="bi bi-people me-1"></i>Community</span>
              <span><i className="bi bi-chat-dots me-1"></i>Real-time chat</span>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3">
                    <i className="bi bi-pencil-square fs-3 text-primary"></i>
                  </div>
                  <div>
                    <h5 className="mb-1 fw-semibold">Rich Text Notes</h5>
                    <p className="text-secondary mb-0 small">Format your notes beautifully.</p>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-success bg-opacity-10 p-3 rounded-4 me-3">
                    <i className="bi bi-people fs-3 text-success"></i>
                  </div>
                  <div>
                    <h5 className="mb-1 fw-semibold">Social Feed</h5>
                    <p className="text-secondary mb-0 small">Follow others and discover ideas.</p>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-info bg-opacity-10 p-3 rounded-4 me-3">
                    <i className="bi bi-chat-dots fs-3 text-info"></i>
                  </div>
                  <div>
                    <h5 className="mb-1 fw-semibold">Direct Messages</h5>
                    <p className="text-secondary mb-0 small">Chat privately with real-time typing.</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded-4 me-3">
                    <i className="bi bi-shield-shaded fs-3 text-warning"></i>
                  </div>
                  <div>
                    <h5 className="mb-1 fw-semibold">Privacy Controls</h5>
                    <p className="text-secondary mb-0 small">Block users, manage visibility.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <h2 className="text-center mb-5 fw-bold" style={{ color: '#2A6F97' }}>
          Everything you need to learn & share
        </h2>
        <div className="row g-4">
          <FeatureCard icon="tags" color="primary" title="Organize with Tags" desc="Categorize notes your way." />
          <FeatureCard icon="heart" color="danger" title="Likes & Comments" desc="Interact with the community." />
          <FeatureCard icon="share" color="success" title="Share Publicly" desc="Generate links for anyone." />
          <FeatureCard icon="bell" color="warning" title="Real‑time Notifications" desc="Never miss an update." />
          <FeatureCard icon="chat-dots" color="info" title="Direct Messages" desc="Chat privately with others." />
          <FeatureCard icon="search" color="secondary" title="Powerful Search" desc="Find notes and people instantly." />
        </div>
      </div>

      <footer className="mt-auto py-4 text-center text-secondary border-top">
        <div className="container">
          <small>© 2026 MemoSD — Made with <i className="bi bi-heart-fill text-danger"></i> in Sudan</small>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, color, title, desc }) {
  return (
    <div className="col-md-4">
      <div className="card h-100 border-0 shadow-sm text-center p-4 rounded-4">
        <i className={`bi bi-${icon} fs-1 text-${color} mb-3`}></i>
        <h5 className="fw-semibold">{title}</h5>
        <p className="text-secondary small">{desc}</p>
      </div>
    </div>
  )
}
