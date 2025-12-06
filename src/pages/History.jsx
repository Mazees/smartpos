import Header from "../components/Header";
import Loading from "../components/Loading";
import Alert from "../components/Alert";
import { useEffect, useState } from "react";
import { getAllOrders, getOrderDetails, realtime } from "../api/api";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [orders, setOrders] = useState([]);
  const [ordersCopy, setOrdersCopy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    variant: "warning",
  });
  const navigate = useNavigate();

  const handleNotification = (message, variant) => {
    setNotification({ message, variant });
    setTimeout(() => setNotification({}), 2500);
  };

  async function loadOrders() {
    setLoading(true);
    const { data, error } = await getAllOrders();
    if (error) {
      console.error(error);
      handleNotification(
        `Error: ${error?.message ?? JSON.stringify(error)}`,
        "error"
      );
      setOrders([]);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    setOrdersCopy([...orders]);
  }, [orders]);

  useEffect(() => {
    loadOrders();
    return realtime("orders", loadOrders);
  }, []);

  const handleItemClick = async (order) => {
    setLoading(true);
    const { data: details, error } = await getOrderDetails(order.id);
    if (error) {
      handleNotification(error.message, "error");
      setLoading(false);
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
    setLoading(false);
  };

  return (
    <Header title="Riwayat Penjualan">
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
                  <div className="poppins-medium text-[14px]">#TRX-{order.id}</div>
                  <div className="text-[10px] uppercase poppins-regular opacity-60 w-fit h-fit rounded-sm p-1 bg-base-200 text-base-content">
                    {order.tgl_pembelian ? new Date(order.tgl_pembelian).toLocaleDateString("id-ID", {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : "-"}
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
    </Header>
  );
};

export default History;
