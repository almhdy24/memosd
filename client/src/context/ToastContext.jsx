import { createContext, useContext } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ToastContext = createContext()

export const useToast = () => useContext(ToastContext)

export const ToastProvider = ({ children }) => {
  const showSuccess = (message) => toast.success(message)
  const showError = (message) => toast.error(message)
  const showInfo = (message) => toast.info(message)
  const showWarning = (message) => toast.warning(message)

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>
      {children}
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </ToastContext.Provider>
  )
}
