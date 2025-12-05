import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const Breadcrumbs = ({ className = "breadcrumbs text-sm" }) => {
  const location = useLocation();
  const [pathLocation, setPathLocation] = useState([]);

  useEffect(() => {
    setPathLocation(location.pathname.split("/").filter((x) => x));
  }, [location.pathname]);

  const getDisplayName = (segment) => {
    const cleanSegment = segment.replace(/-/g, " ");
    return cleanSegment.charAt(0).toUpperCase() + cleanSegment.slice(1);
  };

  if (!pathLocation || pathLocation.length === 0) return null;

  return (
    <div className={className}>
      <ul className="w-full h-fit shrink-0">
        <li className="h-6 w-6 shrink-0 hover:text-base-content hover:bg-base-300 rounded-full bg-base-content text-white flex justify-center items-center">
          <Link to="/">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-4 w-4 stroke-current"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
              />
            </svg>
          </Link>
        </li>
        {pathLocation.map((path, idx) => (
          <li key={`${path}-${idx}`}>
            <Link to={`/${pathLocation.slice(0, idx + 1).join("/")}`}>
              {getDisplayName(path)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Breadcrumbs;
