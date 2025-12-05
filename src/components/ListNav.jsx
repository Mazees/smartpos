import React from "react";
import { Link, useNavigate } from "react-router-dom";

const ListNav = ({ children, to, desc }) => {
  return (
    <Link
      to={to}
      className="w-full border-b p-3 poppins-regular text-sm justify-between items-center hover:bg-base-content/30 hover:text-white flex"
    >
      <h1>{children}</h1>
      <div className="flex gap-2 text-xs items-center">
        <h1>{desc}</h1>
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="m9 5 7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
};

export default ListNav;
