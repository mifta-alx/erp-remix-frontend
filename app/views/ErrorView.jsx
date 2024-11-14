const ErrorView = ({ status, message, description }) => {
  return (
    <div className="py-48 px-4 mx-auto max-w-screen-xl lg:py-24 lg:px-6">
      <div className="mx-auto max-w-screen-sm text-center">
        <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
          {status}
        </h1>
        <p className="mb-4 text-3xl tracking-tight first-letter:capitalize font-bold text-gray-900 md:text-4xl dark:text-white">
          {message}
        </p>
        <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ErrorView;
