import { apiRequest } from "@/lib/api/client";
import type {
  ApiCliente,
  ApiClienteCreate,
  ApiClienteUpdate,
  ApiEquipo,
  ApiEquipoUpdate,
  ApiLog,
  ApiMercado,
  ApiMercadoCreate,
  ApiMercadoUpdate,
  ApiMiembro,
  ApiMiembroAdd,
  ApiProyecto,
  ApiProyectoCreate,
  ApiProyectoUpdate,
  ApiTarea,
  ApiTimesheet,
  ApiToken,
  ApiUsuario,
  ApiUsuarioCreate,
  ApiUsuarioUpdate,
  PaginationParams
} from "@/lib/api/types";

// ── Auth ──────────────────────────────────────────────────

export function apiLogin(email: string, password: string): Promise<ApiToken> {
  return apiRequest<ApiToken>("/api/v1/auth/login", {
    method: "POST",
    body: { email, password }
  });
}

export function apiReadMe(token: string): Promise<ApiUsuario> {
  return apiRequest<ApiUsuario>("/api/v1/usuarios/me", { token });
}

// ── Usuarios ──────────────────────────────────────────────

export function apiListUsuarios(token: string, params?: PaginationParams): Promise<ApiUsuario[]> {
  return apiRequest<ApiUsuario[]>("/api/v1/usuarios", { token, query: params });
}

export function apiCreateUsuario(token: string, input: ApiUsuarioCreate): Promise<ApiUsuario> {
  return apiRequest<ApiUsuario>("/api/v1/usuarios", { token, method: "POST", body: input });
}

export function apiGetUsuario(token: string, usuarioId: string): Promise<ApiUsuario> {
  return apiRequest<ApiUsuario>(`/api/v1/usuarios/${usuarioId}`, { token });
}

export function apiUpdateUsuario(token: string, usuarioId: string, patch: ApiUsuarioUpdate): Promise<ApiUsuario> {
  return apiRequest<ApiUsuario>(`/api/v1/usuarios/${usuarioId}`, { token, method: "PATCH", body: patch });
}

export function apiDeleteUsuario(token: string, usuarioId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/usuarios/${usuarioId}`, { token, method: "DELETE" });
}

// ── Equipos ───────────────────────────────────────────────

export function apiListEquipos(token: string, params?: PaginationParams): Promise<ApiEquipo[]> {
  return apiRequest<ApiEquipo[]>("/api/v1/equipos", { token, query: params });
}

export function apiCreateEquipo(token: string, input: { nombre: string; descripcion?: string }): Promise<ApiEquipo> {
  return apiRequest<ApiEquipo>("/api/v1/equipos", {
    token,
    method: "POST",
    body: { nombre: input.nombre, descripcion: input.descripcion || null }
  });
}

export function apiGetEquipo(token: string, equipoId: string): Promise<ApiEquipo> {
  return apiRequest<ApiEquipo>(`/api/v1/equipos/${equipoId}`, { token });
}

export function apiUpdateEquipo(token: string, equipoId: string, patch: ApiEquipoUpdate): Promise<ApiEquipo> {
  return apiRequest<ApiEquipo>(`/api/v1/equipos/${equipoId}`, { token, method: "PATCH", body: patch });
}

export function apiDeleteEquipo(token: string, equipoId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/equipos/${equipoId}`, { token, method: "DELETE" });
}

// ── Miembros ──────────────────────────────────────────────

export function apiListMiembros(token: string, equipoId: string): Promise<ApiMiembro[]> {
  return apiRequest<ApiMiembro[]>(`/api/v1/equipos/${equipoId}/miembros`, { token });
}

export function apiAddMiembro(token: string, equipoId: string, input: ApiMiembroAdd): Promise<ApiMiembro> {
  return apiRequest<ApiMiembro>(`/api/v1/equipos/${equipoId}/miembros`, { token, method: "POST", body: input });
}

export function apiRemoveMiembro(token: string, equipoId: string, usuarioId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/equipos/${equipoId}/miembros/${usuarioId}`, { token, method: "DELETE" });
}

// ── Mercados ──────────────────────────────────────────────

export function apiListMercados(token: string, params?: PaginationParams): Promise<ApiMercado[]> {
  return apiRequest<ApiMercado[]>("/api/v1/mercados", { token, query: params });
}

export function apiCreateMercado(token: string, input: ApiMercadoCreate): Promise<ApiMercado> {
  return apiRequest<ApiMercado>("/api/v1/mercados", { token, method: "POST", body: input });
}

export function apiGetMercado(token: string, mercadoId: string): Promise<ApiMercado> {
  return apiRequest<ApiMercado>(`/api/v1/mercados/${mercadoId}`, { token });
}

export function apiUpdateMercado(token: string, mercadoId: string, patch: ApiMercadoUpdate): Promise<ApiMercado> {
  return apiRequest<ApiMercado>(`/api/v1/mercados/${mercadoId}`, { token, method: "PATCH", body: patch });
}

export function apiDeleteMercado(token: string, mercadoId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/mercados/${mercadoId}`, { token, method: "DELETE" });
}

// ── Clientes ──────────────────────────────────────────────

export function apiListClientes(token: string, params?: PaginationParams): Promise<ApiCliente[]> {
  return apiRequest<ApiCliente[]>("/api/v1/clientes", { token, query: params });
}

export function apiCreateCliente(token: string, input: ApiClienteCreate): Promise<ApiCliente> {
  return apiRequest<ApiCliente>("/api/v1/clientes", { token, method: "POST", body: input });
}

export function apiGetCliente(token: string, clienteId: string): Promise<ApiCliente> {
  return apiRequest<ApiCliente>(`/api/v1/clientes/${clienteId}`, { token });
}

export function apiUpdateCliente(token: string, clienteId: string, patch: ApiClienteUpdate): Promise<ApiCliente> {
  return apiRequest<ApiCliente>(`/api/v1/clientes/${clienteId}`, { token, method: "PATCH", body: patch });
}

export function apiDeleteCliente(token: string, clienteId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/clientes/${clienteId}`, { token, method: "DELETE" });
}

// ── Proyectos ─────────────────────────────────────────────

export function apiListProyectos(token: string, params?: PaginationParams): Promise<ApiProyecto[]> {
  return apiRequest<ApiProyecto[]>("/api/v1/proyectos", { token, query: params });
}

export function apiCreateProyecto(token: string, input: ApiProyectoCreate): Promise<ApiProyecto> {
  return apiRequest<ApiProyecto>("/api/v1/proyectos", { token, method: "POST", body: input });
}

export function apiGetProyecto(token: string, proyectoId: string): Promise<ApiProyecto> {
  return apiRequest<ApiProyecto>(`/api/v1/proyectos/${proyectoId}`, { token });
}

export function apiUpdateProyecto(token: string, proyectoId: string, patch: ApiProyectoUpdate): Promise<ApiProyecto> {
  return apiRequest<ApiProyecto>(`/api/v1/proyectos/${proyectoId}`, { token, method: "PATCH", body: patch });
}

export function apiDeleteProyecto(token: string, proyectoId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/proyectos/${proyectoId}`, { token, method: "DELETE" });
}

// ── Tareas ────────────────────────────────────────────────

export function apiListTareasByProyecto(token: string, proyectoId: string, params?: PaginationParams): Promise<ApiTarea[]> {
  return apiRequest<ApiTarea[]>(`/api/v1/proyectos/${proyectoId}/tareas`, { token, query: params });
}

export function apiGetTarea(token: string, tareaId: string): Promise<ApiTarea> {
  return apiRequest<ApiTarea>(`/api/v1/tareas/${tareaId}`, { token });
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

// ── Timesheets ────────────────────────────────────────────

export function apiListTimesheets(token: string, params?: PaginationParams): Promise<ApiTimesheet[]> {
  return apiRequest<ApiTimesheet[]>("/api/v1/timesheets", { token, query: params });
}

export function apiGetTimesheet(token: string, timesheetId: string): Promise<ApiTimesheet> {
  return apiRequest<ApiTimesheet>(`/api/v1/timesheets/${timesheetId}`, { token });
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

// ── Logs ──────────────────────────────────────────────────

export function apiListLogs(token: string, params?: PaginationParams): Promise<ApiLog[]> {
  return apiRequest<ApiLog[]>("/api/v1/logs", { token, query: params });
}
