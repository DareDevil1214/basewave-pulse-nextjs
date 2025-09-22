import React from 'react';

interface PublishButtonProps {
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const PublishButton: React.FC<PublishButtonProps> = ({ onClick, disabled = false, children }) => {
  return (
    <button
      onClick={(e) => onClick(e)}
      disabled={disabled}
      className={`
        flex items-center gap-1 px-3 py-1.5 cursor-pointer
        font-medium text-sm tracking-wide rounded-md
        transition-all duration-300
        ${
          disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-400 hover:gap-2 hover:translate-x-3'
        }
      `}
    >
      {children}
      {!disabled && (
        <svg
           className="w-4 h-4"
           stroke="currentColor"
           strokeWidth="1.5"
           viewBox="0 0 24 24"
           fill="none"
           xmlns="http://www.w3.org/2000/svg"
         >
          <path
            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
};

export default PublishButton;