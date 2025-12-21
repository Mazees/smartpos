import React, { useState, useEffect } from "react";

const ConfirmSelect = ({ selectState, onConfirm, onClose }) => {
  const { isOpen, menu, variants } = selectState;
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  // Reset state when menu changes
  useEffect(() => {
    if (menu) {
      setQty(1);
      setNote("");
    }
  }, [menu]);

  const basePrice = menu?.discount_price || menu?.price || 0;
  const totalPrice = basePrice * qty;

  const handleConfirm = () => {
    const cartItem = {
      menu_id: menu.id,
      name: menu.name,
      original_price: menu.price,
      discount_price: menu.discount_price || 0,
      qty: qty,
      note: note,
      variants: [],
      subtotal: totalPrice,
    };
    onConfirm(cartItem);
    onClose();
  };

  const handleQtyChange = (newQty) => {
    setQty(Math.max(1, newQty));
  };

  if (!isOpen || !menu) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
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
            <div className="poppins-regular lg:text-base text-sm opacity-70">
              {variants.map((variant, idx) => (
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
                        />
                        <span className="poppins-regular ml-2 lg:text-base text-sm">
                          {option.name}
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
          <button className="btn btn-secondary" onClick={handleConfirm}>
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmSelect;
