export interface Models {
    userName: string,
    password: string
}
export interface Departamento{
    nombre: string,
    ventanillasIds: string[],
    operacionesIds: string[]
}
export interface Operaciones{
    nombre: string
}
export interface Ventanillas {
    // id es opcional
    nombre: string;
    activo: boolean;
  }
  
export interface Users{
    hospitalId: string
    nombre: string,
    userName: string,
    password:string,
    rol:string
    departamentoId: string,
    ventanillaId: string
}
export interface ventanillasPorId {
    id: string;
    nombre: string;
    activo: boolean;
  }
  