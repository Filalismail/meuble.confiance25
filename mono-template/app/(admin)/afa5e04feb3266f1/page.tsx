"use client"

import { useActionState } from "react"
import { login } from "../_actions/auth"

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, null)

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-medium text-[#0A0A0A]">Thika 25</h1>
          <p className="text-sm text-neutral-500 mt-1">Accès réservé</p>
        </div>
        <form
          action={formAction}
          className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-[#E5E5E5]/60 p-8 shadow-sm space-y-5"
        >
          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">
              Email
            </label>
            <input
              name="email"
              type="text"
              autoComplete="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40 focus:ring-1 focus:ring-[#FF5722]/20"
              placeholder="admin@thika25.dz"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">
              Mot de passe
            </label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40 focus:ring-1 focus:ring-[#FF5722]/20"
              placeholder="••••••••"
            />
          </div>
          {state?.error && (
            <p className="text-xs text-red-500 text-center">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-full bg-[#FF5722] text-white text-sm font-medium hover:bg-[#FF5722]/90 disabled:opacity-50 transition-all"
          >
            {pending ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  )
}
