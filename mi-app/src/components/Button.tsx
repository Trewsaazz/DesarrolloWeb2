import type { ComponentProps } from 'react';

type BotonProps = ComponentProps<'button'> & {
  variante?: 'primario' | 'oscuro';
};

export default function Boton({
  variante = 'primario',
  type = 'button',
  className = '',
  ...props
}: BotonProps) {
  return (
    <button type={type} className={`boton boton--${variante} ${className}`.trim()} {...props} />
  );
}
