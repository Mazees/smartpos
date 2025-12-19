import ListNav from "../components/ListNav";
import Breadcrumbs from "../components/Breadcrumbs";
import {
  getAllKategori,
  getAllMenu,
  getAllVariant,
  realtime,
} from "../api/api";
import { useEffect, useState } from "react";
import Alert from "../components/Alert";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ManageStore = () => {
  const queryClient = useQueryClient();
  const {
    data: kategori = [],
    isError: isKategoriError,
    error: kategoriError,
  } = useQuery({ queryKey: ["kategori"], queryFn: getAllKategori });
  const {
    data: menu = [],
    isLoading: loading,
    isError: isMenuError,
    error: menuError,
  } = useQuery({ queryKey: ["menu"], queryFn: getAllMenu });
  const {
    data: variant = [],
    isError: isVariantError,
    error: variantError,
  } = useQuery({ queryKey: ["variant"], queryFn: getAllVariant });
  useEffect(() => {
    if (menuError) {
      console.error(menuError);
    }
    if (kategoriError) {
      console.error(kategoriError);
    }
    if (isVariantError) {
      console.error(kategoriError);
    }
    const unsubMenu = realtime("menu", () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    });
    const unsubKategori = realtime("kategori", () => {
      queryClient.invalidateQueries({ queryKey: ["kategori"] });
    });
    const unsubVariant = realtime("variant", () => {
      queryClient.invalidateQueries({ queryKey: ["variant"] });
    });
    return () => {
      unsubMenu();
      unsubKategori();
    };
  }, []);
  return (
    <>
      <ListNav to="/kelola/daftar-menu" desc={`${menu.length} Menu`}>
        Daftar Menu
      </ListNav>
      <ListNav to="/kelola/varian" desc={`${variant.length} Varian Menu`}>
        Daftar Varian
      </ListNav>
      <ListNav to="/kelola/kategori" desc={`${kategori.length} Kategori`}>
        Daftar Kategori
      </ListNav>
      {/* <ListNav to="/kelola/member" desc={`${kategori.length} Kategori`}>
        Daftar Member
      </ListNav> */}
    </>
  );
};

export default ManageStore;
