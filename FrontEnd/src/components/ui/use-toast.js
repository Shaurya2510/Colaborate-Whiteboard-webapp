import { useCallback } from "react"

export function useToast() {
    const toast = useCallback(({ title, description, variant = "default" }) => {
        const bgColor = variant === "destructive" ? "bg-red-600" : "bg-green-600"

        const toastContainer = document.createElement("div")
        toastContainer.className = `
      fixed top-5 right-5 z-[10000] px-4 py-3 rounded text-white shadow-lg transition-opacity duration-300 ${bgColor}
    `
        toastContainer.innerHTML = `
      <strong>${title}</strong><div>${description}</div>
    `
        document.body.appendChild(toastContainer)

        setTimeout(() => {
            toastContainer.style.opacity = "0"
            setTimeout(() => document.body.removeChild(toastContainer), 300)
        }, 3000)
    }, [])

    return { toast }
}
