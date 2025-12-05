import React from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../api/api";
import Breadcrumbs from "./Breadcrumbs";

const Header = ({ children, title }) => {
  let navigate = useNavigate();
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Navbar */}
        <nav className="navbar sticky top-0 lg:top-2 z-30 w-full lg:rounded-lg lg:mt-2 lg:ml-2 bg-base-300">
          <label
            htmlFor="my-drawer-4"
            aria-label="open sidebar"
            className="btn btn-square btn-ghost"
          >
            {/* Sidebar toggle icon */}
            <svg
              className="inline-block size-5 is-drawer-open:hidden"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m6 10 1.99994 1.9999-1.99994 2M11 5v14m-7 0h16c.5523 0 1-.4477 1-1V6c0-.55228-.4477-1-1-1H4c-.55228 0-1 .44772-1 1v12c0 .5523.44772 1 1 1Z"
              />
            </svg>
          </label>
          <h1 className="poppins-extrabold text-xl ml-2">{title}</h1>
        </nav>
        <div className="overflow-y-scroll w-full lg:h-[calc(100vh-4rem)] px-4 py-2 flex flex-col">
          <Breadcrumbs />
          {children}
        </div>
      </div>

      <div className="drawer-side is-drawer-close:overflow-visible z-50">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="flex min-h-[calc(100vh-12px)] flex-col items-start bg-base-300 lg:mt-2 lg:ml-2 rounded-lg is-drawer-close:w-14 is-drawer-open:w-72 transition-all">
          <div className="is-drawer-close:hidden rounded-lg  w-full my-10">
            <h1 className="poppins-extrabold bg-clip-text text-transparent bg-linear-to-r from-50% from-base-content to-orange-600 to-50% text-2xl text-center w-full">
              {import.meta.env.VITE_NAMA_TOKO}
            </h1>
          </div>
          <ul className="menu w-full">
            <li>
              <button
                onClick={() => {
                  navigate("/");
                }}
                className="hover:bg-base-200 active:bg-amber-800 active:text-white w-full"
                data-tip="Buat Pesanan"
              >
                <svg
                  className="my-1.5 inline-block size-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                    d="M8 7V6a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1M3 18v-7a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                  />
                </svg>

                <span className="is-drawer-close:hidden poppins-medium">
                  Buat Pesanan
                </span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  navigate("/kelola");
                }}
                className="hover:bg-base-200 active:bg-amber-800 active:text-white w-full"
                data-tip="Kelola Menu"
              >
                <svg
                  className="my-1.5 inline-block size-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18.011 13H20c-.367 2.5551-2.32 4.6825-4.9766 5.6162V20H8.97661v-1.3838C6.31996 17.6825 4.36697 15.5551 4 13h14.011Zm0 0c1.0995-.0059 1.989-.8991 1.989-2 0-.8637-.5475-1.59948-1.3143-1.87934M18.011 13H18m0-3.99997c.2409 0 .4718.04258.6857.12063m0 0c.8367-1.0335.7533-2.67022-.2802-3.50694-1.0335-.83672-2.5496-.6772-3.3864.35631-.293-1.50236-1.7485-2.15377-3.2509-1.8607-1.5023.29308-2.48263 1.74856-2.18956 3.25092C8.9805 6.17263 7.6182 5.26418 6.15462 6.00131 4.967 6.59945 4.45094 8.19239 5.04909 9.38002m0 0C4.37083 9.66467 4 10.3357 4 11.1174 4 12.1571 4.84288 13 5.88263 13m-.83354-3.61998c.2866-.12029 1.09613-.40074 2.04494.3418m5.27497-.89091c1.0047-.4589 2.1913-.01641 2.6502.98832"
                  />
                </svg>

                <span className="is-drawer-close:hidden poppins-medium">
                  Kelola Toko
                </span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  navigate("/riwayat");
                }}
                className="hover:bg-base-200 active:bg-amber-800 active:text-white w-full"
                data-tip="Riwayat Transaksi"
              >
                <svg
                  className="my-1.5 inline-block size-5"
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
                    stroke-width="2"
                    d="M5.005 11.19V12l6.998 4.042L19 12v-.81M5 16.15v.81L11.997 21l6.998-4.042v-.81M12.003 3 5.005 7.042l6.998 4.042L19 7.042 12.003 3Z"
                  />
                </svg>

                <span className="is-drawer-close:hidden poppins-medium">
                  Riwayat Penjualan
                </span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  navigate("/laporan");
                }}
                className="hover:bg-base-200 active:bg-amber-800 active:text-white w-full"
                data-tip="Laporan Penjualan"
              >
                <svg
                  className="my-1.5 inline-block size-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18.011 13H20c-.367 2.5551-2.32 4.6825-4.9766 5.6162V20H8.97661v-1.3838C6.31996 17.6825 4.36697 15.5551 4 13h14.011Zm0 0c1.0995-.0059 1.989-.8991 1.989-2 0-.8637-.5475-1.59948-1.3143-1.87934M18.011 13H18m0-3.99997c.2409 0 .4718.04258.6857.12063m0 0c.8367-1.0335.7533-2.67022-.2802-3.50694-1.0335-.83672-2.5496-.6772-3.3864.35631-.293-1.50236-1.7485-2.15377-3.2509-1.8607-1.5023.29308-2.48263 1.74856-2.18956 3.25092C8.9805 6.17263 7.6182 5.26418 6.15462 6.00131 4.967 6.59945 4.45094 8.19239 5.04909 9.38002m0 0C4.37083 9.66467 4 10.3357 4 11.1174 4 12.1571 4.84288 13 5.88263 13m-.83354-3.61998c.2866-.12029 1.09613-.40074 2.04494.3418m5.27497-.89091c1.0047-.4589 2.1913-.01641 2.6502.98832"
                  />
                </svg>

                <span className="is-drawer-close:hidden poppins-medium">
                  Laporan Penjualan
                </span>
              </button>
            </li>
          </ul>
          <button
            className="btn btn-neutral w-[90%] mx-auto mt-5 is-drawer-close:hidden"
            onClick={() => {
              logoutUser();
            }}
          >
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
