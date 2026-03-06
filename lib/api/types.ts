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
};

export type ApiEquipo = {
  equipo_id: string;
  nombre: string;
  descripcion?: string | null;
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
  created_at?: string | null;
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
};
