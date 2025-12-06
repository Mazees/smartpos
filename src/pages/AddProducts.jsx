import React, { useEffect } from "react";
import Header from "../components/Header";
import Breadcrumbs from "../components/Breadcrumbs";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getAllKategori, realtime, deleteMenu } from "../api/api";
import Alert from "../components/Alert";
import { editMenu, addMenu } from "../api/api";
import WarningModal from "../components/WarningModal";

const AddProducts = () => {
  const location = useLocation();
  const [dataProducts, setDataProducts] = useState(location.state || {});
  const navigate = useNavigate();

  // Controlled form state (populate from location.state when editing)
  const [nama, setNama] = useState(dataProducts.name ?? "");
  const [harga, setHarga] = useState(dataProducts.price ?? "");
  const [diskon, setDiskon] = useState(dataProducts.discount_price ?? "");
  const [selectedKategori, setSelectedKategori] = useState(
    dataProducts.id_kategori ?? ""
  );
  const [status, setStatus] = useState(
    typeof dataProducts.status === "boolean" ? dataProducts.status : true
  );
  const [kategori, setKategori] = useState([]);
  const loadData = async () => {
    const { data, error } = await getAllKategori();
    if (error) {
      console.error(error);
      handleNotification(
        `Error: ${error?.message ?? JSON.stringify(error)}`,
        "error"
      );
      return;
    }
    setKategori(data || []);
    console.log("loaded kategori", data);
  };

  const [notification, setNotification] = useState({
    message: "",
    variant: "warning",
  });

  const handleNotification = (message, variant) => {
    setNotification({ message, variant });
    setTimeout(() => setNotification({}), 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama || nama.trim() === "") {
      handleNotification("Nama menu wajib diisi", "warning");
      return;
    }
    if (!selectedKategori) {
      handleNotification("Pilih kategori", "warning");
      return;
    }

    try {
      if (dataProducts && dataProducts.id) {
        const { data, error } = await editMenu(
          dataProducts.id,
          nama,
          Number(harga),
          selectedKategori,
          status,
          Number(diskon)
        );
        if (error) {
          console.error(error);
          handleNotification(
            `Error: ${error?.message ?? JSON.stringify(error)}`,
            "error"
          );
        } else {
          handleNotification("Berhasil mengubah menu", "success");
          setTimeout(() => navigate(-1), 1500);
        }
      } else {
        const { data, error } = await addMenu(
          nama,
          Number(harga),
          selectedKategori,
          Number(diskon),
          status
        );
        if (error) {
          console.error(error);
          handleNotification(
            `Error: ${error?.message ?? JSON.stringify(error)}`,
            "error"
          );
        } else {
          handleNotification("Menu berhasil ditambahkan", "success");
          setTimeout(() => navigate(-1), 1500);
        }
      }
    } catch (err) {
      console.error(err);
      handleNotification("Error saat menyimpan menu", "error");
    }
  };

  // auto-dismiss notifications after short delay
  useEffect(() => {
    if (!notification.message) return;
    const t = setTimeout(
      () => setNotification({ message: "", variant: "warning" }),
      3500
    );
    return () => clearTimeout(t);
  }, [notification.message]);

  useEffect(() => {
    console.log(dataProducts);
    loadData();
    const unsub = realtime("kategori", loadData);

    return () => {
      try {
        unsub();
      } catch (e) {}
    };
  }, []);
  return (
    <Header title="Edit/Tambah Menu">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full h-full border p-4">
        {notification.message && (
          <Alert
            message={notification.message}
            variant={notification.variant}
          />
        )}

        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <legend className="fieldset-legend">Details Menu</legend>

          <label className="label">Nama Menu:</label>
          <input
            type="text"
            className="input w-full"
            placeholder="Masukkan nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />

          <label className="label">Harga:</label>
          <input
            type="number"
            className="input w-full"
            placeholder="Masukkan harga"
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
          />

          <label className="label">Harga Diskon:</label>
          <input
            type="number"
            className="input w-full"
            placeholder="Masukkan harga diskon (isi 0 jika tidak ingin diskon)"
            value={diskon}
            onChange={(e) => setDiskon(e.target.value)}
            min={0}
          />
          <label className="label">Kategori:</label>
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="select appearance-none"
          >
            <option value="" disabled>
              Pilih kategori
            </option>
            {kategori.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama_kategori ?? item.name ?? `#${item.id}`}
              </option>
            ))}
          </select>

          <label className="label">
            <input
              type="checkbox"
              className="checkbox"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
            />
            Tersedia
          </label>
          <button
            type="submit"
            className="btn btn-neutral w-full mt-5 poppins-bold"
          >
            {dataProducts && dataProducts.id ? "UPDATE" : "SUBMIT"}
          </button>
        </form>
        {dataProducts && dataProducts.id ? (
          <WarningModal
            title="Hapus Menu"
            message="Apakah Anda yakin ingin menghapus menu ini?"
            modalId="my_modal_6"
            onConfirm={async () => {
              const { data, error } = await deleteMenu(dataProducts.id);
              if (error) {
                handleNotification(
                  `Error: ${error?.message ?? JSON.stringify(error)}`,
                  "error"
                );
              } else {
                handleNotification("Berhasil menghapus menu", "success");
                setTimeout(() => navigate(-1), 1500);
              }
            }}
          >
            <div className="btn btn-error w-full poppins-bold">DELETE</div>
          </WarningModal>
        ) : (
          ""
        )}
      </fieldset>
    </Header>
  );
};

export default AddProducts;
