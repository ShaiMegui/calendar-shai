interface ErrorAlertProps {
  isError: boolean;
  error: any;
}

export const ErrorAlert = ({ isError, error }: ErrorAlertProps) => {
  if (!isError) return null;

  return (
    <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
      <p className="font-medium">Error: {error?.message || "Something went wrong"}</p>
    </div>
  );
};