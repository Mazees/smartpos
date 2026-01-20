import Loading from "../components/Loading";
import Alert from "../components/Alert";
import { useEffect, useState } from "react";
import { getAllOrders, getOrderDetails, realtime } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const History = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    data: orders = [],
    isLoading: loading,
    isError: ordersError,
    error,
  } = useQuery({ queryKey: ["orders"], queryFn: getAllOrders });
  const [notification, setNotification] = useState({
    message: "",
    variant: "warning",
  });

  const handleNotification = (message, variant) => {
    setNotification({ message, variant });
    setTimeout(() => setNotification({}), 2500);
  };

  // Computed value - orders copy (auto updates when orders changes)
  const ordersCopy = orders ? [...orders] : [];

  useEffect(() => {
    if (ordersError) {
      console.error(error);
      handleNotification(
        `Error: ${error?.message ?? JSON.stringify(error)}`,
        "error"
      );
    }
    return realtime("orders", () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    });
  }, [ordersError]);

  const handleItemClick = async (order) => {
    const { data: details, error } = await getOrderDetails(order.id);
    if (error) {
      handleNotification(error.message, "error");
      return;
    }

    const qty = details.reduce((acc, item) => acc + item.qty, 0);
    const change = order.cash ? order.cash - order.total_price : 0;
    const orderWithChange = { ...order, change };

    navigate("/riwayat/detail-transaksi", {
      state: {
        orders: orderWithChange,
        details: details,
        qty: qty,
      },
    });
  };

  return (
    <>
      {notification.message && (
        <Alert message={notification.message} variant={notification.variant} />
      )}

      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loading message="Memuat riwayat..." />
        </div>
      ) : (
        <>
          <div className="py-4 opacity-60 tracking-wide">
            Semua Riwayat Penjualan:
          </div>
          <ul className="list flex-1 bg-base-100">
            {ordersCopy.map((order, idx) => (
              <li
                key={order.id || idx}
                onClick={() => handleItemClick(order)}
                className="list-row flex items-center hover:bg-base-content/30 hover:text-white hover:cursor-pointer rounded-lg"
              >
                <div className="flex not-lg:flex-col lg:items-center lg:gap-3 gap-1">
                  <div className="poppins-medium text-[14px]">
                    #TRX-{order.id}
                  </div>
                  <div className="text-[10px] uppercase poppins-regular opacity-60 w-fit h-fit rounded-sm p-1 bg-base-200 text-base-content">
                    {order.tgl_pembelian
                      ? new Date(order.tgl_pembelian).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "-"}
                  </div>
                </div>
                <div className="poppins-medium text-[14px] ml-auto flex flex-col shrink-0">
                  <h1>{`Rp ${order.total_price?.toLocaleString("id-ID")}`}</h1>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
};

export default History;
