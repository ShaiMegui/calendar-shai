interface HourButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const HourButton = ({ label, isActive, onClick }: HourButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-1 text-sm font-medium transition-colors
        ${
          isActive
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }
      `}
    >
      {label}
    </button>
  );
};

export default HourButton;