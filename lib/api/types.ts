export type ApiToken = {
  access_token: string;
  token_type: string;
};

export type ApiUsuario = {
  usuario_id: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol?: string;
  activo?: boolean;
  last_login_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ApiUsuarioCreate = {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  rol?: string;
  activo?: boolean;
};

export type ApiUsuarioUpdate = {
  nombre?: string;
  apellidos?: string;
  email?: string;
  rol?: string;
  activo?: boolean;
  password?: string;
};

export type ApiEquipo = {
  equipo_id: string;
  nombre: string;
  descripcion?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ApiEquipoUpdate = {
  nombre?: string;
  descripcion?: string;
};

export type ApiMiembro = {
  equipo_id: string;
  usuario_id: string;
  rol_equipo: string;
  joined_at?: string | null;
};

export type ApiProyecto = {
  proyecto_id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  equipo_id?: string | null;
  owner_usuario_id?: string | null;
  mercado_id?: string | null;
  cliente_id?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ApiProyectoCreate = {
  codigo: string;
  nombre: string;
  descripcion?: string;
  equipo_id?: string;
  owner_usuario_id?: string;
  mercado_id?: string;
  cliente_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
};

export type ApiProyectoUpdate = {
  nombre?: string;
  descripcion?: string;
  equipo_id?: string;
  mercado_id?: string;
  cliente_id?: string;
  owner_usuario_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
};

export type ApiTarea = {
  tarea_id: string;
  proyecto_id: string;
  titulo: string;
  descripcion?: string | null;
  estado?: string;
  prioridad?: string;
  asignado_a?: string | null;
  fecha_vencimiento?: string | null;
  creada_por?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ApiTimesheet = {
  timesheet_id: string;
  usuario_id: string;
  proyecto_id?: string | null;
  tarea_id?: string | null;
  status: string;
  clock_in: string;
  clock_out?: string | null;
  minutes_worked: number;
  notas?: string | null;
  created_at?: string | null;
};

export type ApiMiembroAdd = {
  usuario_id: string;
  rol_equipo?: string;
};

export type ApiMercado = {
  mercado_id: string;
  nombre: string;
  descripcion?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ApiMercadoCreate = {
  nombre: string;
  descripcion?: string;
};

export type ApiMercadoUpdate = {
  nombre?: string;
  descripcion?: string;
};

export type ApiCliente = {
  cliente_id: string;
  nif: string;
  nombre_comercial?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  cp?: string | null;
  pais: string;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ApiClienteCreate = {
  nif: string;
  nombre_comercial?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  cp?: string;
  pais?: string;
  activo?: boolean;
};

export type ApiClienteUpdate = {
  nombre_comercial?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  cp?: string;
  pais?: string;
  activo?: boolean;
};

export type ApiLog = {
  log_id: number;
  created_at?: string | null;
  usuario_id?: string | null;
  entity: string;
  entity_id?: string | null;
  action: string;
  level: string;
  message?: string | null;
  old_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
};

export type PaginationParams = {
  skip?: number;
  limit?: number;
};
