import supabase from "./supabase";

// --- Realtime ---
export const realtime = (table, loadData) => {
  const channel = supabase
    .channel("menu-updates")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: table,
      },
      (payload) => {
        loadData();
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
};

// --- Auth ---
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const logoutUser = async () => {
  const { data, error } = await supabase.auth.signOut();
  return { data, error };
};

// --- Menu ---
export const getAllMenu = async () => {
  const { data, error } = await supabase.from("menu").select("*");
  if (error) throw error;
  return data;
};

export const getAllReadyMenu = async () => {
  const { data, error } = await supabase
    .from("menu")
    .select("*")
    .eq("status", true);
  if (error) throw error;
  return data;
};

export const addMenu = async (
  nama = "",
  harga = 0,
  kategori,
  diskon = 0,
  status = true
) => {
  const { data, error } = await supabase
    .from("menu")
    .insert([
      {
        name: nama,
        price: harga,
        status: status,
        id_kategori: kategori,
        discount_price: diskon,
      },
    ])
    .select();
  return { data, error };
};

export const editMenu = async (id, nama, harga, kategori, status, diskon) => {
  const { data, error } = await supabase
    .from("menu")
    .update({
      name: nama,
      price: harga,
      status: status,
      id_kategori: kategori,
      discount_price: diskon,
    })
    .eq("id", id)
    .select();
  return { data, error };
};

export const deleteMenu = async (id) => {
  const { data, error } = await supabase
    .from("menu")
    .delete()
    .eq("id", id)
    .select();
  return { data, error };
};

// --- Varian ---
export const getAllVariant = async () => {
  const { data, error } = await supabase.from("variant").select("*");
  if (error) throw error;
  return data;
};

export const addVariant = async (
  name,
  desc,
  required,
  multiple,
  options = []
) => {
  const { data, error } = await supabase
    .from("variant")
    .insert([
      {
        name: name,
        desc: desc,
        required: required,
        multiple: multiple,
        options: options,
      },
    ])
    .select();
  return { data, error };
};
export const updateVariant = async (
  id,
  name,
  desc,
  required,
  multiple,
  options = []
) => {
  const { data, error } = await supabase
    .from("variant")
    .update([
      {
        name: name,
        desc: desc,
        required: required,
        multiple: multiple,
        options: options,
      },
    ])
    .eq("id", id)
    .select();
  return { data, error };
};
export const deleteVariant = async (id) => {
  const { data, error } = await supabase
    .from("variant")
    .delete()
    .eq("id", id)
    .select();
  return { data, error };
};

// --- Kategori ---
export const getAllKategori = async () => {
  const { data, error } = await supabase.from("kategori").select("*");
  if (error) throw error;
  return data;
};

export const addKategori = async (namaKategori = "") => {
  const { data, error } = await supabase
    .from("kategori")
    .insert([
      {
        name: namaKategori,
      },
    ])
    .select();
  return { data, error };
};

export const updateKategori = async (idKategori, namaKategori) => {
  const { data, error } = await supabase
    .from("kategori")
    .update([{ name: namaKategori }])
    .eq("id", idKategori)
    .select();
  return { data, error };
};

export const deleteKategori = async (id) => {
  const { data, error } = await supabase
    .from("kategori")
    .delete()
    .eq("id", id)
    .select();
  return { data, error };
};

// --- Orders ---
export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("tgl_pembelian", { ascending: false });
  if (error) throw error;
  return data;
};

export const getOrderDetails = async (orderId) => {
  const { data, error } = await supabase
    .from("order_details")
    .select("*")
    .eq("orders_id", orderId);
  return { data, error };
};

export const addOrders = async (customer_name, total_price, cash) => {
  const { data, error } = await supabase
    .from("orders")
    .insert([
      {
        customer_name: customer_name,
        total_price: total_price,
        cash: cash,
      },
    ])
    .select();
  return { data, error };
};

export const addOrderDetails = async (orderDetails = []) => {
  const { data, error } = await supabase
    .from("order_details")
    .insert(orderDetails)
    .select();
  return { data, error };
};

// --- Members ---
export const getAllMembers = async () => {
  const { data, error } = await supabase.from("members").select("*");
  return { data, error };
};

export const addMembers = async (name) => {
  const { data, error } = await supabase
    .from("members")
    .insert([
      {
        name,
      },
    ])
    .select();
  return { data, error };
};
