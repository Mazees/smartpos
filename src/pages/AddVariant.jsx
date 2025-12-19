import React, { useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Alert from "../components/Alert";
import { motion, AnimatePresence } from "framer-motion";
import WarningModal from "../components/WarningModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addVariant, updateVariant } from "../api/api";

const AddVariant = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [dataVariant, setDataVariant] = useState(location.state || {});
  const navigate = useNavigate();

  const handleNotification = (message, variant) => {
    setNotification({ message, variant });
    setTimeout(() => setNotification({}), 1500);
  };

  const [namaVariant, setNamaVariant] = useState(dataVariant.name ?? "");
  const [deskripsi, setDeskripsi] = useState(dataVariant.desc ?? "");
  const [required, setRequired] = useState(dataVariant.required ?? false);
  const [multiple, setMultiple] = useState(dataVariant.multiple ?? false);
  const [options, setOptions] = useState(
    dataVariant.options?.sort((a, b) => a.position - b.position) ?? []
  );

  const [notification, setNotification] = useState({
    message: "",
    variant: "warning",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation - Nama variant
    if (!namaVariant || namaVariant.trim() === "") {
      handleNotification("Nama variant wajib diisi", "warning");
      return;
    }

    // Validation - Options minimal 1
    if (!options || options.length === 0) {
      handleNotification("Minimal harus ada 1 opsi variant", "warning");
      return;
    }

    // Validation - Semua opsi harus terisi
    const emptyOptions = options.filter(
      (opt) => !opt.name || opt.name.trim() === ""
    );
    if (emptyOptions.length > 0) {
      handleNotification("Semua nama opsi harus diisi", "warning");
      return;
    }

    try {
      let result;
      
      // Check if create or update mode
      if (dataVariant && dataVariant.id) {
        // Update mode
        result = await updateVariant(
          dataVariant.id,
          namaVariant,
          deskripsi,
          required,
          multiple,
          options
        );
      } else {
        // Create mode
        result = await addVariant(
          namaVariant,
          deskripsi,
          required,
          multiple,
          options
        );
      }

      if (result.error) {
        handleNotification("Gagal menyimpan variant", "error");
      } else {
        handleNotification("Variant berhasil disimpan", "success");
        setTimeout(() => navigate(-1), 1500);
      }
    } catch (err) {
      console.error(err);
      handleNotification("Terjadi kesalahan", "error");
    }
  };

  const handleAddOption = () => {
    setOptions([
      ...options,
      { id: options.length + 1, position: options.length + 1, name: "", price: 0 },
    ]);
  };

  const handleRemoveOption = (id) => {
    setOptions(options.filter((opt) => opt.id !== id));
  };

  const handleOptionChange = (id, field, value) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt))
    );
  };

  return (
    <>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full h-full border p-4">
        <Alert message={notification.message} variant={notification.variant} />

        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <legend className="fieldset-legend">Details Variant</legend>

          <label className="label">Nama Variant:</label>
          <input
            type="text"
            className="input w-full"
            placeholder="Contoh: Level Pedas, Ukuran, Topping"
            value={namaVariant}
            onChange={(e) => setNamaVariant(e.target.value)}
            required
          />

          <label className="label">Deskripsi (Opsional):</label>
          <textarea
            className="textarea w-full"
            placeholder="Deskripsi variant"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={3}
          />

          <label className="label flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
            <span>Wajib dipilih pelanggan</span>
          </label>
          <label className="label flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox"
              checked={multiple}
              onChange={(e) => setMultiple(e.target.checked)}
            />
            <span>Multiple select</span>
          </label>

          <div className="divider">Opsi Variant</div>

          {options.map((option, index) => (
            <div key={option.id} className="flex gap-2 items-start">
              <div className="flex-1">
                <label className="label text-xs">Nama Opsi {index + 1}:</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Contoh: Pedas, Tidak Pedas"
                  value={option.name}
                  onChange={(e) =>
                    handleOptionChange(option.id, "name", e.target.value)
                  }
                />
              </div>
              <div className="w-32">
                <label className="label text-xs">Harga Tambahan:</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="0"
                  value={option.price}
                  onChange={(e) =>
                    handleOptionChange(
                      option.id,
                      "price",
                      Number(e.target.value)
                    )
                  }
                />
              </div>
              {options.length > 1 && (
                <button
                  type="button"
                  className="btn btn-error btn-sm my-auto"
                  onClick={() => handleRemoveOption(option.id)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="btn btn-outline w-full mt-2"
            onClick={handleAddOption}
          >
            + Tambah Opsi
          </button>

          <button
            type="submit"
            className="btn btn-neutral w-full mt-5 poppins-bold"
          >
            SUBMIT
          </button>
        </form>
        {dataVariant && dataVariant.id ? (
          <WarningModal
            title="Hapus Variant"
            message={
              <>
                Apakah Anda yakin ingin menghapus variant ini?
                <br />
                <br />
                Note:
                <br /> Menghapus variant akan mempengaruhi menu yang menggunakan
                variant ini.
              </>
            }
            modalId="my_modal_6"
            onConfirm={async () => {
              // TODO: Implement delete functionality
              handleNotification(
                "Fitur hapus belum diimplementasikan",
                "warning"
              );
              setTimeout(() => navigate(-1), 1500);
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

export default AddVariant;
