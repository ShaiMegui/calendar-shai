interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const PageTitle = ({ title, subtitle, className = "" }: PageTitleProps) => {
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-gray-500">{subtitle}</p>
      )}
    </div>
  );
};

export default PageTitle;