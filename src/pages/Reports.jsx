import React from "react";
import Header from "../components/Header";
import Breadcrumbs from "../components/Breadcrumbs";

const Reports = () => {
  return (
    <Header title="Laporan Penjualan">
      <div className="p-10">
        <button className="tooltip tooltip-right hover:cursor-pointer">
          Hover Me
        </button>
      </div>
    </Header>
  );
};

export default Reports;
