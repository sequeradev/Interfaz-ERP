"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiUsuario, ApiUsuarioCreate, ApiUsuarioUpdate } from "@/lib/api/types";

type UsuarioModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (input: ApiUsuarioCreate | ApiUsuarioUpdate) => void;
  usuario?: ApiUsuario | null;
};

export function UsuarioModal({ open, onClose, onSave, usuario }: UsuarioModalProps) {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("user");
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && usuario) {
      setNombre(usuario.nombre);
      setApellidos(usuario.apellidos);
      setEmail(usuario.email);
      setPassword("");
      setRol(usuario.rol ?? "user");
      setActivo(usuario.activo ?? true);
    } else if (open) {
      setNombre("");
      setApellidos("");
      setEmail("");
      setPassword("");
      setRol("user");
      setActivo(true);
    }
    setError(null);
  }, [open, usuario]);

  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) {
      setError("Nombre y email son obligatorios.");
      return;
    }
    if (!usuario && !password) {
      setError("La contrasena es obligatoria para nuevos usuarios.");
      return;
    }

    if (usuario) {
      const patch: ApiUsuarioUpdate = {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        email: email.trim(),
        rol,
        activo,
        ...(password ? { password } : {})
      };
      onSave(patch);
    } else {
      onSave({
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        email: email.trim(),
        password,
        rol,
        activo
      } satisfies ApiUsuarioCreate);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2933]/35 p-4" role="presentation" onMouseDown={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-lift" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="font-heading text-2xl font-semibold text-text-primary mb-5">
          {usuario ? "Editar usuario" : "Crear usuario"}
        </h2>

        <form className="space-y-3" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Input id="usr-nombre" label="Nombre" value={nombre} onChange={(e) => { setNombre(e.target.value); setError(null); }} />
            <Input id="usr-apellidos" label="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
          </div>
          <Input id="usr-email" label="Email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} />
          <Input id="usr-password" label={usuario ? "Nueva contrasena (opcional)" : "Contrasena"} type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="usr-rol" className="block text-sm font-medium text-text-primary">Rol</label>
              <select id="usr-rol" value={rol} onChange={(e) => setRol(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-3 text-base text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2">
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="usr-activo" className="block text-sm font-medium text-text-primary">Estado</label>
              <select id="usr-activo" value={activo ? "true" : "false"} onChange={(e) => setActivo(e.target.value === "true")} className="h-11 w-full rounded-xl border border-line bg-white px-3 text-base text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-state-error">{error}</p>}

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" className="w-auto px-5" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="w-auto px-5">{usuario ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
