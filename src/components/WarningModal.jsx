import React from "react";

const WarningModal = ({
  modalId = "warning_modal",
  triggerText = "Batalkan Pesanan",
  title = "Batalkan Pesanan",
  message = "Apakah Anda yakin ingin membatalkan pesanan?",
  onConfirm,
  /**
   * If `trigger` (React node) is provided it will be rendered inside a label
   * with htmlFor={modalId}. Otherwise when `showTrigger` is true the
   * default trigger (the red H1) is rendered. Set `showTrigger` to false
   * to render only the modal (useful when you want to create your own
   * trigger elsewhere with a label and the same `modalId`).
   */
  children,
  showTrigger = true,
}) => {
  return (
    <>
      {children ? (
        <label htmlFor={modalId}>{children}</label>
      ) : (
        showTrigger && (
          <label htmlFor={modalId}>
            <h1 className="w-full hover:cursor-pointer text-center mt-2 text-red-500 hover:text-red-800">
              {triggerText}
            </h1>
          </label>
        )
      )}

      <input type="checkbox" id={modalId} className="modal-toggle" />
      <div className="modal z-50" role="dialog">
        <div className="modal-box">
          <h3 className="text-xl font-bold hover:cursor-pointer">{title}</h3>
          <p className="py-4 text-base">{message}</p>
          <div className="modal-action flex-col flex">
            <label
              onClick={() => onConfirm && onConfirm()}
              htmlFor={modalId}
              className="btn btn-error w-full"
            >
              Iya
            </label>
            <label htmlFor={modalId} className="btn w-full">
              Tidak
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default WarningModal;
