import React, { useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  getAllKategori,
  getAllVariant,
  getVariantMenuByIdMenu,
  realtime,
  deleteMenu,
  countVariantMenu,
  saveMenuVariants,
} from "../api/api";
import Alert from "../components/Alert";
import { editMenu, addMenu } from "../api/api";
import WarningModal from "../components/WarningModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AddProducts = () => {
  const queryClinent = useQueryClient();
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
  const {
    data: selectedVariants = [],
    isLoading: loadingSelectedVariants,
    isError: isSelectedVariantsError,
    error: errorSelectedVariants,
  } = useQuery({
    queryKey: ["selectedVariants"],
    queryFn: () => getVariantMenuByIdMenu(location.state.id),
    enabled: !!location.state?.id,
  });
  const [selectedVariantCopy, setSelectedVariantCopy] = useState([]);
  useEffect(() => {
    setSelectedVariantCopy([...selectedVariants]);
  }, [selectedVariants]);
  const {
    data: kategori = [],
    isLoading: loading,
    isError,
    error: errorKategori,
  } = useQuery({ queryKey: ["kategori"], queryFn: getAllKategori });
  const {
    data: variants = [],
    isLoading: loadingVariants,
    isError: isVariantError,
    error: errorVariant,
  } = useQuery({ queryKey: ["variants"], queryFn: getAllVariant });
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

    // ... existing validation ...

    try {
      let menuId;

      // Save/Update menu
      if (dataProducts && dataProducts.id) {
        // Update mode
        const { data, error } = await editMenu(
          dataProducts.id,
          nama,
          Number(harga),
          selectedKategori,
          status,
          Number(diskon)
        );
        if (error) throw error;
        menuId = dataProducts.id;
      } else {
        // Create mode
        const { data, error } = await addMenu(
          nama,
          Number(harga),
          selectedKategori,
          Number(diskon),
          status
        );
        if (error) throw error;
        menuId = data[0].id;
      }

      // Save variants (both create & update mode)
      const { error: variantError } = await saveMenuVariants(
        menuId,
        selectedVariantCopy
      );

      if (variantError) {
        handleNotification("Menu tersimpan tapi variant gagal", "warning");
      } else {
        handleNotification(
          dataProducts?.id
            ? "Menu berhasil diupdate"
            : "Menu berhasil ditambahkan",
          "success"
        );
        setTimeout(() => navigate(-1), 1500);
      }
    } catch (err) {
      console.error(err);
      handleNotification("Error saat menyimpan menu", "error");
    }
  };

  useEffect(() => {
    console.log("selectedVariantCopy", selectedVariantCopy);
  }, [selectedVariantCopy]);

  const handleAddVariant = async (variant) => {
    const variantCount = await countVariantMenu();
    setSelectedVariantCopy([
      ...selectedVariantCopy,
      {
        id_variant: variant.id,
        id_menu: dataProducts.id,
        position: variantCount + 1,
      },
    ]);
    document.getElementById("variant_modal").close();
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
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
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

          <div className="divider">Variant Menu</div>
          {selectedVariantCopy.length > 0 ? (
            <div className="flex flex-col gap-2 mb-3">
              {variants
                .filter((variant) =>
                  selectedVariantCopy.find(
                    (item) => item.id_variant === variant.id
                  )
                )
                .sort((a, b) => a.position - b.position)
                .map((variant, index) => {
                  return (
                    <div
                      key={variant.id}
                      className="p-3 border rounded-lg flex items-center justify-between gap-3"
                    >
                      <div className="poppins-medium">{variant.name}</div>
                      <button
                        type="button"
                        className="btn btn-error btn-sm"
                        onClick={() => {
                          setSelectedVariantCopy(
                            selectedVariantCopy.filter(
                              (item) => item.id_variant !== variant.id
                            )
                          );
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-sm opacity-60 mb-3">
              Belum ada variant dipilih untuk menu ini.
            </div>
          )}

          <button
            type="button"
            className="btn btn-outline w-full"
            onClick={() => document.getElementById("variant_modal").showModal()}
          >
            + Tambahkan Variant
          </button>

          {/* Modal untuk pilih variant */}
          <dialog id="variant_modal" className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Pilih Variant</h3>

              {loadingVariants ? (
                <div className="text-sm opacity-60">Memuat variant...</div>
              ) : variants.length === 0 ? (
                <div className="text-sm opacity-60">
                  Belum ada variant. Buat variant terlebih dahulu.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {variants
                    .filter((v) => {
                      return !selectedVariantCopy.some(
                        (variant) => variant.id_variant === v.id
                      );
                    })
                    .map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        className="btn btn-outline justify-start text-left h-auto py-3"
                        onClick={() => handleAddVariant(variant)}
                      >
                        <span className="font-medium">{variant.name}</span>
                      </button>
                    ))}

                  {variants.filter((v) => !selectedVariants.includes(v.id))
                    .length === 0 && (
                    <div className="text-sm opacity-60 text-center py-4">
                      Semua variant sudah ditambahkan
                    </div>
                  )}
                </div>
              )}

              <div className="modal-action">
                <form method="dialog">
                  <button className="btn">Tutup</button>
                </form>
              </div>
            </div>
          </dialog>

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
    </>
  );
};

export default AddProducts;
