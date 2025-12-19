import React, { useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { addKategori, updateKategori, deleteKategori } from "../api/api";
import Alert from "../components/Alert";
import { motion, AnimatePresence } from "framer-motion";
import WarningModal from "../components/WarningModal";

const AddKategori = () => {
  const location = useLocation();
  const [dataKategori, setDataKategori] = useState(location.state || {});
  const navigate = useNavigate();

  const handleNotification = (message, variant) => {
    setNotification({ message, variant });
    setTimeout(() => setNotification({}), 1500);
  };

  // Controlled form state
  const [namaKategori, setNamaKategori] = useState(dataKategori.name ?? "");

  const [notification, setNotification] = useState({
    message: "",
    variant: "warning",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!namaKategori || namaKategori.trim() === "") {
      handleNotification("Nama kategori wajib diisi", "warning");
      return;
    }

    try {
      if (dataKategori && dataKategori.id) {
        const { data, error } = await updateKategori(
          dataKategori.id,
          namaKategori
        );
        if (error) {
          console.error(error);
          handleNotification(
            `Error: ${error?.message ?? JSON.stringify(error)}`,
            "error"
          );
        } else {
          handleNotification("Kategori berhasil diperbarui", "success");
          setTimeout(() => navigate(-1), 1500);
        }
      } else {
        const { data, error } = await addKategori(namaKategori);
        if (error) {
          console.error(error);
          handleNotification(
            `Error: ${error?.message ?? JSON.stringify(error)}`,
            "error"
          );
        } else {
          handleNotification("Kategori berhasil ditambahkan", "success");
          setTimeout(() => navigate(-1), 1500);
        }
      }
    } catch (err) {
      console.error(err);
      handleNotification("Error saat menyimpan kategori", "error");
    }
  };

  return (
    <>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full h-full border p-4">
        <Alert message={notification.message} variant={notification.variant} />

        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <legend className="fieldset-legend">Details Kategori</legend>

          <label className="label">Nama Kategori:</label>
          <input
            type="text"
            className="input w-full"
            placeholder="Masukkan nama kategori"
            value={namaKategori}
            onChange={(e) => setNamaKategori(e.target.value)}
            required
          />

          <button
            type="submit"
            className="btn btn-neutral w-full mt-5 poppins-bold"
          >
            SUBMIT
          </button>
        </form>
        {dataKategori && dataKategori.id ? (
          <WarningModal
            title="Hapus Kategori"
            message={
              <>
                Apakah Anda yakin ingin menghapus kategori ini?
                <br />
                <br />
                Note:
                <br /> menghapus kategori juga akan menghapus semua menu yang
                termasuk dalam kategori ini.
              </>
            }
            modalId="my_modal_6"
            onConfirm={async () => {
              const { data, error } = await deleteKategori(dataKategori.id);
              if (error) {
                handleNotification(
                  `Error: ${error?.message ?? JSON.stringify(error)}`,
                  "error"
                );
                setTimeout(() => navigate(-1), 1500);
              } else {
                handleNotification("Berhasil menghapus kategori", "success");
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
    </>
  );
};

export default AddKategori;
