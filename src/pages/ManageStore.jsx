import Header from "../components/Header";
import ListNav from "../components/ListNav";
import Breadcrumbs from "../components/Breadcrumbs";
import { getAllKategori, getAllMenu, realtime } from "../api/api";
import { useEffect, useState } from "react";
import Alert from "../components/Alert";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ManageStore = () => {
  const queryClient = useQueryClient();
  const {
    data: kategori = [],
    isLoading,
    isError: isKategoriError,
    error: kategoriError,
  } = useQuery({ queryKey: ["kategori"], queryFn: getAllKategori });
  const {
    data: menu = [],
    isLoading: loading,
    isError: isMenuError,
    error: menuError,
  } = useQuery({ queryKey: ["readyMenu"], queryFn: getAllMenu });
  useEffect(() => {
    if (menuError) {
      console.error(menuError);
    }
    if (kategoriError) {
      console.error(kategoriError);
    }
    const unsubMenu = realtime("menu", () => {
      queryClient.invalidateQueries({ queryKey: ["readyMenu"] });
    });
    const unsubKategori = realtime("kategori", () => {
      queryClient.invalidateQueries({ queryKey: ["kategori"] });
    });
    return () => {
      unsubMenu();
      unsubKategori();
    };
  }, []);
  return (
    <Header title="Kelola Toko">
      <ListNav to="/kelola/daftar-menu" desc={`${menu.length} Menu`}>
        Daftar Menu
      </ListNav>
      <ListNav to="/kelola/kategori" desc={`${kategori.length} Kategori`}>
        Daftar Kategori
      </ListNav>
      {/* <ListNav to="/kelola/member" desc={`${kategori.length} Kategori`}>
        Daftar Member
      </ListNav> */}
    </Header>
  );
};

export default ManageStore;
