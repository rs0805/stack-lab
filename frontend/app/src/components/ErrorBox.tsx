interface ErrorBoxProps {
  message: string;
}

const ErrorBox = ({ message }: ErrorBoxProps) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-600 text-red-800 text-sm font-medium py-3 px-4 mt-4 w-fit">
      {message}
    </div>
  );
};

export default ErrorBox;
