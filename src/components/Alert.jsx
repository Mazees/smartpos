import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const Alert = ({ message, variant = "warning" } = {}) => {
  const variantClass = {
    success: "alert-success",
    error: "alert-error",
    warning: "alert-warning",
    info: "alert-info",
  }[variant];

  return (
    message && (
      <AnimatePresence>
        <motion.div
          className=" fixed top-10 left-1/2 z-50 w-11/12 max-w-lg -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
        >
          <div role="alert" className={`alert ${variantClass}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{message}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  );
};

export default Alert;
