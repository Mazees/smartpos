import Breadcrumbs from "../components/Breadcrumbs";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { CartContext } from "../contexts/CartContext";
import { useContext } from "react";
import WarningModal from "../components/WarningModal";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getVariantByIdMenu, getAllVariant } from "../api/api";

const DetailOrders = () => {
  const queryClient = useQueryClient();
  const { cart, setCart } = useContext(CartContext);
  const isFirst = useRef(true);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!location.state) {
      navigate(-1);
    }
  }, [location.state, navigate]);
  const [dataOrder, setDataOrder] = useState(location.state ?? null);
  const [quantity, setQuantity] = useState(dataOrder?.qty ?? 0);
  const [notes, setNotes] = useState(dataOrder?.note ?? "");
  const [indexCart, setIndexCart] = useState(dataOrder?.idx ?? 0);
  const [selectedVariants, setSelectedVariants] = useState(
    dataOrder?.variants ?? []
  );
  const { data: variantsItem = [] } = useQuery({
    queryKey: ["variantsItem"],
    queryFn: () => getVariantByIdMenu(dataOrder?.menu_id),
    enabled: !!dataOrder?.menu_id,
  });
  const { data: variants = [] } = useQuery({
    queryKey: ["variants"],
    queryFn: getAllVariant,
    enabled: !!dataOrder?.menu_id,
  });
  const [variantPrice, setVariantPrice] = useState(0);

  useEffect(() => {
    setVariantPrice(
      selectedVariants.reduce(
        (sum, variant) =>
          sum + variant.options.reduce((sum2, opt) => sum2 + opt.price, 0),
        0
      )
    );
  }, [selectedVariants]);

  const basePrice =
    dataOrder.discount_price && dataOrder.discount_price !== 0
      ? dataOrder.discount_price
      : dataOrder.original_price;
  const totalPrice = basePrice * quantity + variantPrice;

  const updateHandle = () => {
    setCart((prev) => {
      const updated = [...prev];
      updated[indexCart] = {
        ...updated[indexCart],
        qty: quantity,
        note: notes,
        subtotal: quantity * totalPrice,
        variants: [...selectedVariants],
      };
      return updated;
    });
  };
  useEffect(() => {
    console.log(variantsItem);
    if (quantity <= 0) {
      setQuantity(1);
    }
  }, [quantity, variantsItem]);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return; // skip efek pertama kali
    }
    if (cart.length == 0) {
      navigate("/");
    } else {
      navigate(-1);
    }
  }, [cart]);
  const handleVariantChange = (variant, option, isChecked) => {
    setSelectedVariants((prev) => {
      const variantIndex = prev.findIndex((v) => v.id === variant.id);

      if (variantIndex === -1) {
        // Variant belum ada - create new
        if (!isChecked) return prev;
        return [
          ...prev,
          {
            id: variant.id,
            name: variant.name,
            required: variant.required,
            multiple: variant.multiple,
            options: [
              { id: option.id, name: option.name, price: option.price },
            ],
          },
        ];
      }

      // Variant sudah ada - update options
      return prev
        .map((vart, idx) => {
          if (idx !== variantIndex) return vart;

          if (variant.multiple) {
            // Checkbox - toggle
            if (isChecked) {
              return {
                ...vart,
                options: [
                  ...vart.options,
                  { id: option.id, name: option.name, price: option.price },
                ],
              };
            } else {
              const newOptions = vart.options.filter(
                (opt) => opt.id !== option.id
              );
              return newOptions.length === 0
                ? null
                : { ...vart, options: newOptions };
            }
          } else {
            // Radio - replace
            return {
              ...vart,
              options: [
                { id: option.id, name: option.name, price: option.price },
              ],
            };
          }
        })
        .filter(Boolean);
    });
  };
  return (
    <>
      {dataOrder ? (
        <>
          <h1 className="poppins-bold text-xl mt-5">{dataOrder.name}</h1>
          <p className="poppins-regular text-sm">
            Rp{" "}
            {(dataOrder.discount_price && dataOrder.discount_price !== 0
              ? dataOrder.discount_price
              : dataOrder.original_price
            )?.toLocaleString("id-ID")}
          </p>
          <div className="poppins-regular lg:text-base text-sm opacity-70 flex flex-col gap-2 mt-2">
            {variantsItem.map((variant, idx) => (
              <div>
                <h3
                  className="poppins-medium lg:text-base text-sm"
                  key={variant.id || idx}
                >
                  {variant.name}:
                </h3>
                <div className="flex flex-col gap-2 mt-2">
                  {variant.options.map((option, idx) => (
                    <label htmlFor="variant.id">
                      <input
                        className={variant.multiple ? "checkbox" : "radio"}
                        type={variant.multiple ? "checkbox" : "radio"}
                        name={`variant-${variant.id}`}
                        id={`option-${option.id}`}
                        value={option.name}
                        required={variant.required}
                        checked={selectedVariants
                          .find((selVar) => selVar.id === variant.id)
                          .options.find((vart) => vart.id === option.id)}
                        onChange={(e) =>
                          handleVariantChange(variant, option, e.target.checked)
                        }
                      />
                      <span className="poppins-regular ml-2 lg:text-base text-sm">
                        {option.name}: Rp {option.price.toLocaleString("id-ID")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend poppins-regular">
              Tambahkan Catatan:
            </legend>
            <textarea
              className="textarea h-24 w-full resize-none"
              placeholder="Catatan"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
            <div className="label">Contoh: pedas/tidak pedas, tanpa sayur</div>
          </fieldset>
          <div className="flex items-center justify-between w-full rounded-lg border p-1">
            <button
              className="btn"
              onClick={() => setQuantity((prev) => prev - 1)}
            >
              -
            </button>
            <input
              className="poppins-bold w-full text-center outline-none"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <button
              className="btn"
              onClick={() => setQuantity((prev) => prev + 1)}
            >
              +
            </button>
          </div>
          <WarningModal
            title="Hapus Pesanan"
            message="Apakah Anda yakin ingin menghapus pesanan ini?"
            modalId="my_modal_6"
            onConfirm={async () => {
              setCart((prev) => prev.filter((_, i) => i !== indexCart));
            }}
          >
            <span className="btn btn-error text-white w-full mt-5">
              HAPUS PESANAN
            </span>
          </WarningModal>
          <button className="btn w-full mt-5" onClick={updateHandle}>
            SIMPAN
          </button>
        </>
      ) : (
        <div className="p-6 text-center opacity-60">Keranjang kosong</div>
      )}
    </>
  );
};

export default DetailOrders;
