import { apiRequest } from "@/lib/api/client";
import type {
  ApiEquipo,
  ApiMiembro,
  ApiProyecto,
  ApiTarea,
  ApiTimesheet,
  ApiToken,
  ApiUsuario
} from "@/lib/api/types";

export function apiLogin(email: string, password: string): Promise<ApiToken> {
  return apiRequest<ApiToken>("/api/v1/auth/login", {
    method: "POST",
    body: { email, password }
  });
}

export function apiReadMe(token: string): Promise<ApiUsuario> {
  return apiRequest<ApiUsuario>("/api/v1/usuarios/me", { token });
}

export function apiListEquipos(token: string): Promise<ApiEquipo[]> {
  return apiRequest<ApiEquipo[]>("/api/v1/equipos", { token });
}

export function apiCreateEquipo(token: string, input: { nombre: string; descripcion?: string }): Promise<ApiEquipo> {
  return apiRequest<ApiEquipo>("/api/v1/equipos", {
    token,
    method: "POST",
    body: { nombre: input.nombre, descripcion: input.descripcion || null }
  });
}

export function apiListMiembros(token: string, equipoId: string): Promise<ApiMiembro[]> {
  return apiRequest<ApiMiembro[]>(`/api/v1/equipos/${equipoId}/miembros`, { token });
}

export function apiListProyectos(token: string): Promise<ApiProyecto[]> {
  return apiRequest<ApiProyecto[]>("/api/v1/proyectos", { token });
}

export function apiListTareasByProyecto(token: string, proyectoId: string): Promise<ApiTarea[]> {
  return apiRequest<ApiTarea[]>(`/api/v1/proyectos/${proyectoId}/tareas`, { token });
}

export function apiCreateTarea(
  token: string,
  proyectoId: string,
  input: {
    titulo: string;
    descripcion?: string;
    estado?: string;
    prioridad?: string;
    asignado_a?: string;
    fecha_vencimiento?: string;
  }
): Promise<ApiTarea> {
  return apiRequest<ApiTarea>(`/api/v1/proyectos/${proyectoId}/tareas`, {
    token,
    method: "POST",
    body: {
      ...input,
      descripcion: input.descripcion || null,
      asignado_a: input.asignado_a || null,
      fecha_vencimiento: input.fecha_vencimiento || null
    }
  });
}

export function apiUpdateTarea(
  token: string,
  tareaId: string,
  patch: {
    titulo?: string;
    descripcion?: string;
    estado?: string;
    prioridad?: string;
    asignado_a?: string | null;
    fecha_vencimiento?: string | null;
  }
): Promise<ApiTarea> {
  return apiRequest<ApiTarea>(`/api/v1/tareas/${tareaId}`, {
    token,
    method: "PATCH",
    body: patch
  });
}

export function apiDeleteTarea(token: string, tareaId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/tareas/${tareaId}`, {
    token,
    method: "DELETE"
  });
}

export function apiClockIn(
  token: string,
  payload: { proyecto_id?: string; tarea_id?: string; notas?: string }
): Promise<ApiTimesheet> {
  return apiRequest<ApiTimesheet>("/api/v1/timesheets/clock-in", {
    token,
    method: "POST",
    body: {
      proyecto_id: payload.proyecto_id || null,
      tarea_id: payload.tarea_id || null,
      notas: payload.notas || null
    }
  });
}

export function apiClockOut(token: string, timesheetId: string, notas?: string): Promise<ApiTimesheet> {
  return apiRequest<ApiTimesheet>(`/api/v1/timesheets/${timesheetId}/clock-out`, {
    token,
    method: "PATCH",
    body: { notas: notas || null }
  });
}
