import Header from "../components/Header";
import ListNav from "../components/ListNav";
import Breadcrumbs from "../components/Breadcrumbs";
import { getAllKategori, getAllMenu, realtime } from "../api/api";
import { useEffect, useState } from "react";
import Alert from "../components/Alert";

const ManageStore = () => {
  const [kategori, setKategori] = useState([]);
  const [menu, setMenu] = useState([]);

  const loadData = async () => {
    const { data: menuData, error: menuError } = await getAllMenu();
    const { data: kategoriData, error: kategoriError } = await getAllKategori();
    if (menuError) {
      console.error(menuError);
    }
    if (kategoriError) {
      console.error(kategoriError);
    }
    setKategori(kategoriData || []);
    setMenu(menuData || []);
    console.log({ kategoriData, menuData });
  };

  useEffect(() => {
    loadData();
    const unsubMenu = realtime("menu", loadData);
    const unsubKategori = realtime("kategori", loadData);
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
