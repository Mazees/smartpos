import { useState, useEffect, useMemo } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import Loading from "../components/Loading";
import { getAllKategori, realtime } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import Alert from "../components/Alert";

const Kategori = () => {
  const queryClient = useQueryClient();
  const {
    data: kategori = [],
    isLoading: loading,
    isError,
    error: errorKategori,
  } = useQuery({ queryKey: ["kategori"], queryFn: getAllKategori });
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    message: "",
    variant: "warning",
  });
  const handleNotification = (message, variant) => {
    setNotification({ message, variant });
    setTimeout(() => setNotification({}), 2500);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const kategoriCopy = useMemo(() => {
    if (!kategori) return [];
    let result = [...kategori];
    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();
      result = result.filter((item) =>
        item.name.toLowerCase().includes(keyword)
      );
    }
    return result.sort((a, b) => b.price - a.price);
  }, [kategori, searchTerm]);

  useEffect(() => {
    if (errorKategori) {
      console.error(errorKategori);
      handleNotification(
        `Error: ${errorKategori?.message ?? JSON.stringify(errorKategori)}`,
        "error"
      );
    }
    return realtime("kategori", () => {
      queryClient.invalidateQueries({ queryKey: ["kategori"] });
    });
  }, []);
  return (
    <>
      {notification.message && (
        <Alert message={notification.message} variant={notification.variant} />
      )}
      <button
        className="btn btn-circle btn-accent btn-lg fixed z-50 bottom-8 right-8"
        onClick={() => navigate("/kelola/kategori/edit-kategori")}
      >
        +
      </button>
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loading message="Memuat kategori..." />
        </div>
      ) : (
        <>
          <div className="py-4 opacity-60 tracking-wide">
            Semua Daftar Kategori:
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
              onInput={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
            />
          </label>
          <ul className="list bg-base-100">
            {kategoriCopy.map((kategori, idx) => (
              <li
                onClick={() =>
                  navigate("/kelola/kategori/edit-kategori", {
                    state: kategori,
                  })
                }
                className="list-row rounded-lg hover:cursor-pointer flex items-center hover:bg-base-content/30 hover:text-white"
              >
                <div className="flex not-lg:flex-col lg:items-center lg:gap-3 gap-1">
                  <h1 className="poppins-medium text-[14px]">
                    {kategori.name}
                  </h1>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
};

export default Kategori;
