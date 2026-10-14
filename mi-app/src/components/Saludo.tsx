
export default function Saludo({nombre, apellido}:{nombre: string; apellido?: string}){
    return <p>Hola, {nombre} {apellido} </p>
}