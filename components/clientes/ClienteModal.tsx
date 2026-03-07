"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiCliente, ApiClienteCreate, ApiClienteUpdate } from "@/lib/api/types";

type ClienteModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (input: ApiClienteCreate | ApiClienteUpdate) => void;
  cliente?: ApiCliente | null;
};

export function ClienteModal({ open, onClose, onSave, cliente }: ClienteModalProps) {
  const [nif, setNif] = useState("");
  const [nombreComercial, setNombreComercial] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [cp, setCp] = useState("");
  const [pais, setPais] = useState("ES");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && cliente) {
      setNif(cliente.nif);
      setNombreComercial(cliente.nombre_comercial ?? "");
      setEmail(cliente.email ?? "");
      setTelefono(cliente.telefono ?? "");
      setDireccion(cliente.direccion ?? "");
      setCiudad(cliente.ciudad ?? "");
      setProvincia(cliente.provincia ?? "");
      setCp(cliente.cp ?? "");
      setPais(cliente.pais);
    } else if (open) {
      setNif("");
      setNombreComercial("");
      setEmail("");
      setTelefono("");
      setDireccion("");
      setCiudad("");
      setProvincia("");
      setCp("");
      setPais("ES");
    }
    setError(null);
  }, [open, cliente]);

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
    if (!cliente && !nif.trim()) {
      setError("El NIF es obligatorio.");
      return;
    }

    if (cliente) {
      onSave({
        nombre_comercial: nombreComercial.trim() || undefined,
        email: email.trim() || undefined,
        telefono: telefono.trim() || undefined,
        direccion: direccion.trim() || undefined,
        ciudad: ciudad.trim() || undefined,
        provincia: provincia.trim() || undefined,
        cp: cp.trim() || undefined,
        pais: pais.trim() || undefined
      } satisfies ApiClienteUpdate);
    } else {
      onSave({
        nif: nif.trim(),
        nombre_comercial: nombreComercial.trim() || undefined,
        email: email.trim() || undefined,
        telefono: telefono.trim() || undefined,
        direccion: direccion.trim() || undefined,
        ciudad: ciudad.trim() || undefined,
        provincia: provincia.trim() || undefined,
        cp: cp.trim() || undefined,
        pais: pais.trim() || "ES"
      } satisfies ApiClienteCreate);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2933]/35 p-4" role="presentation" onMouseDown={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-lift" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="font-heading text-2xl font-semibold text-text-primary mb-5">
          {cliente ? "Editar cliente" : "Crear cliente"}
        </h2>

        <form className="space-y-3" onSubmit={handleSubmit} noValidate>
          {!cliente && (
            <Input id="nif" label="NIF" value={nif} onChange={(e) => { setNif(e.target.value); setError(null); }} error={error ?? undefined} placeholder="B12345678" />
          )}
          <Input id="nombre_comercial" label="Nombre comercial" value={nombreComercial} onChange={(e) => setNombreComercial(e.target.value)} placeholder="Empresa S.L." />
          <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contacto@empresa.com" />
          <Input id="telefono" label="Telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+34 600 000 000" />
          <Input id="direccion" label="Direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input id="ciudad" label="Ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
            <Input id="provincia" label="Provincia" value={provincia} onChange={(e) => setProvincia(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input id="cp" label="Codigo postal" value={cp} onChange={(e) => setCp(e.target.value)} />
            <Input id="pais" label="Pais" value={pais} onChange={(e) => setPais(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" className="w-auto px-5" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="w-auto px-5">{cliente ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
