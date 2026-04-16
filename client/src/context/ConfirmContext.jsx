import { createContext, useContext, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'

const ConfirmContext = createContext()

export const useConfirm = () => useContext(ConfirmContext)

export const ConfirmProvider = ({ children }) => {
  const [dialog, setDialog] = useState({ show: false, title: '', message: '', resolve: null })

  const confirm = (title, message) => {
    return new Promise((resolve) => {
      setDialog({ show: true, title, message, resolve })
    })
  }

  const handleConfirm = () => {
    dialog.resolve?.(true)
    setDialog({ ...dialog, show: false })
  }

  const handleCancel = () => {
    dialog.resolve?.(false)
    setDialog({ ...dialog, show: false })
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        show={dialog.show}
        title={dialog.title}
        message={dialog.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  )
}
