import { useState, useEffect } from "react";
import Header from "../components/Header";
import Breadcrumbs from "../components/Breadcrumbs";
import Loading from "../components/Loading";
import { getAllKategori, realtime } from "../api/api";
import { useNavigate } from "react-router-dom";

const Kategori = () => {
  const [kategori, setKategori] = useState([]);
  const [kategoriCopy, setkategoriCopy] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const loadData = async () => {
    setLoading(true);
    const { data, error } = await getAllKategori();
    if (error) {
      console.error(error);
      setKategori([]);
    } else {
      setKategori(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    setkategoriCopy([...kategori]);
  }, [kategori]);

  useEffect(() => {
    loadData();
    const unsub = realtime("kategori", loadData);

    return () => {
      try {
        unsub();
      } catch (e) {}
    };
  }, []);
  return (
    <Header title="Daftar Kategori Menu">
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
              onInput={(e) =>
                setkategoriCopy(
                  kategori.filter((item) =>
                    item.name
                      .toLowerCase()
                      .includes(e.target.value.toLowerCase())
                  )
                )
              }
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
    </Header>
  );
};

export default Kategori;
