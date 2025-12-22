import { useState, useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import { getAllVariant } from "../api/api";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { realtime } from "../api/api";

const Variant = () => {
  const queryClient = useQueryClient();
  const {
    data: variants = [],
    isLoading: loading,
    isError,
    error,
  } = useQuery({ queryKey: ["variants"], queryFn: getAllVariant });

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({
    message: "",
    variant: "warning",
  });

  const handleNotification = (message, variant) => {
    setNotification({ message, variant });
    setTimeout(() => setNotification({}), 2500);
  };

  // Filter variants based on search term
  const filteredVariants = variants.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isError) handleNotification(error, "error");
    return realtime("variant", () => {
      queryClient.invalidateQueries({ queryKey: ["variants"] });
    });
  }, [isError, error, queryClient]);

  return (
    <>
      {notification.message && (
        <Alert message={notification.message} variant={notification.variant} />
      )}
      <button
        className="btn btn-circle btn-accent btn-lg fixed z-50 bottom-8 right-8"
        onClick={() => navigate("/kelola/varian/tambah-varian")}
      >
        +
      </button>
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loading message="Memuat varian..." />
        </div>
      ) : (
        <>
          <div className="py-4 opacity-60 tracking-wide">
            Semua Daftar Varian:
          </div>
          <label className="input not-lg:w-full mb-3">
            <svg
              className="h-[1em] opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              value={searchTerm}
              onInput={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
            />
          </label>
          <ul className="list bg-base-100">
            {filteredVariants.map((variant, idx) => (
              <li
                key={variant.id}
                onClick={() =>
                  navigate("/kelola/varian/tambah-varian", {
                    state: variant,
                  })
                }
                className="list-row rounded-lg hover:cursor-pointer flex items-center hover:bg-base-content/30 hover:text-white"
              >
                <div className="flex not-lg:flex-col lg:items-center lg:gap-3 gap-1">
                  <h1 className="poppins-medium text-[14px]">{variant.name}</h1>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
};

export default Variant;
