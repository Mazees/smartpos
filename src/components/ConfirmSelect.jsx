import React, { useState, useEffect } from "react";
import Alert from "./Alert";

const ConfirmSelect = ({ selectState, onConfirm, onClose }) => {
  const { isOpen, menu, variants } = selectState;
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [variantSelected, setVariantSelected] = useState([]);
  const [variantPrice, setVariantPrice] = useState(0);
  const [notification, setNotification] = useState({
    message: "",
    variant: "warning",
  });

  const handleNotification = (message, variant) => {
    setNotification({ message, variant });
    setTimeout(() => setNotification({}), 1500);
  };

  useEffect(() => {
    setVariantPrice(
      variantSelected.reduce(
        (sum, variant) =>
          sum + variant.options.reduce((sum2, opt) => sum2 + opt.price, 0),
        0
      )
    );
  }, [variantSelected]);

  // Reset state when menu changes
  useEffect(() => {
    if (menu) {
      setQty(1);
      setNote("");
    }
  }, [menu]);

  const basePrice = menu?.discount_price || menu?.price || 0;
  const totalPrice = basePrice * qty + variantPrice;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      variants.some(
        (vart) =>
          vart.required &&
          vart.multiple &&
          !variantSelected.find((varted) => vart.id === varted.id)
      )
    ) {
      handleNotification("Tolong pilih variant yang wajib dipilih!", "warning")
      return;
    }
    const cartItem = {
      menu_id: menu.id,
      name: menu.name,
      original_price: menu.price,
      discount_price: menu.discount_price || 0,
      qty: qty,
      note: note,
      variants: [...variantSelected],
      subtotal: totalPrice,
    };
    onConfirm(cartItem);
    setVariantSelected([]);
    onClose();
  };

  const handleQtyChange = (newQty) => {
    setQty(Math.max(1, newQty));
  };

  /* [
  {
    variant_id: 1,
    variant_name: "Level Pedas",
    options: [
      { detail_id: 3, name: "Pedas", price: 0 }
    ]
  },
  {
    variant_id: 2,
    variant_name: "Topping",
    options: [
      { detail_id: 5, name: "Cheese", price: 5000 },
      { detail_id: 6, name: "Meat", price: 8000 }
    ]
  }
]
  */

  const handleVariantChange = (variant, option, isChecked) => {
    setVariantSelected((prev) => {
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

  if (!isOpen || !menu) return null;

  return (
    <>
      <Alert message={notification.message} variant={notification.variant} />
      <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
        <form onSubmit={handleSubmit} className="modal-box">
          {/* Menu Info */}
          <h1 className="poppins-bold lg:text-xl">{menu.name}</h1>
          <div className="flex gap-2 items-center mt-1">
            <span
              className={`poppins-regular lg:text-base text-sm ${
                menu.discount_price ? "line-through opacity-60" : ""
              }`}
            >
              Rp {menu.price.toLocaleString("id-ID")}
            </span>
            {menu.discount_price > 0 && (
              <span className="poppins-medium lg:text-base text-sm">
                Rp {menu.discount_price.toLocaleString("id-ID")}
              </span>
            )}
          </div>

          {/* Variants Display */}
          {variants && variants.length > 0 && (
            <div className="mt-4">
              <div className="poppins-regular lg:text-base text-sm opacity-70 flex flex-col gap-4">
                {variants.map((variant, idx) => (
                  <div>
                    <h3
                      className="poppins-medium lg:text-base text-sm"
                      key={variant.id || idx}
                    >
                      {variant.name}{variant.required && variant.multiple ? " (Wajib Pilih Minimal 1)" : variant.required ? " (Wajib Pilih Salah Satu)" : ""}:
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
                            required={variant.required && !variant.multiple}
                            onChange={(e) =>
                              handleVariantChange(
                                variant,
                                option,
                                e.target.checked
                              )
                            }
                          />
                          <span className="poppins-regular ml-2 lg:text-base text-sm">
                            {option.name}: Rp{" "}
                            {option.price.toLocaleString("id-ID")}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qty Selector */}
          <div className="mt-4">
            <label className="label">
              <span className="label-text poppins-medium lg:text-base text-sm">
                Jumlah:
              </span>
            </label>
            <div className="flex items-center justify-between w-full rounded-lg border p-1">
              <button
                className="btn btn-sm lg:text-base text-sm"
                onClick={() => handleQtyChange(qty - 1)}
                disabled={qty <= 1}
              >
                -
              </button>
              <input
                className="poppins-bold w-full text-center outline-none"
                type="number"
                value={qty}
                min="1"
                onChange={(e) => handleQtyChange(parseInt(e.target.value) || 1)}
              />
              <button
                className="btn btn-sm"
                onClick={() => handleQtyChange(qty + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="mt-4">
            <label className="label">
              <span className="label-text poppins-medium lg:text-base text-sm">
                Catatan (opsional):
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Contoh: Tanpa bawang, extra pedas, dll"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="2"
            />
          </div>

          {/* Total */}
          <div className="mt-4 p-3 bg-base-200 rounded-lg flex justify-between items-center">
            <span className="poppins-medium lg:text-base text-sm">Total:</span>
            <span className="text-xl font-bold">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-secondary">
              Tambah ke Keranjang
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
};

export default ConfirmSelect;
