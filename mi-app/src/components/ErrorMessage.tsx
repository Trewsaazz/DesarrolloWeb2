import Boton from './Button.tsx';

interface Props {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ title = 'Algo salió mal', message, onRetry }: Props) {
  return (
    <div className="error" role="alert">
      <p className="error__title">{title}</p>
      <p>{message}</p>
      {onRetry && <Boton onClick={onRetry}>Reintentar</Boton>}
    </div>
  );
}
