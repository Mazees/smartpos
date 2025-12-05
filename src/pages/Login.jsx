import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";

const Login = () => {
  let navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      // PERBAIKAN 1: Destructuring langsung (pecah data dan error)
      const { data, error } = await loginUser(email, password);

      // PERBAIKAN 2: Cek error dari Supabase dulu
      if (error) {
        setLoginError(error.message); // Tampilkan pesan asli dari Supabase (misal: "Invalid login credentials")
        return; // Stop proses
      }

      // PERBAIKAN 3: Cek data user
      if (data?.user) {
        console.log("Login berhasil! User ID:", data.user.id);
        navigate("/");
      } else {
        // Jaga-jaga jika sukses tapi data kosong (jarang terjadi)
        setLoginError("Login gagal. Silakan coba lagi.");
      }
    } catch (err) {
      setLoginError("Terjadi kesalahan sistem.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form
      className="w-screen h-screen flex flex-col justify-center items-center gap-3"
      onSubmit={handleSubmit} // Menambahkan handler submit
    >
      <h1 className="poppins-extrabold bg-clip-text text-transparent bg-linear-to-r from-50% from-base-content to-orange-600 to-50% text-2xl text-center w-full">
        SMARTPOS LOGIN
      </h1>

      {/* Input Email */}
      <label className="input validator">
        {/* ... SVG Email ... */}
        <input
          type="email"
          placeholder="mail@site.com"
          required
          value={email} // Controlled Input
          onChange={(e) => setEmail(e.target.value)} // Update State
        />
      </label>
      <div className="validator-hint hidden">Enter valid email address</div>

      {/* Input Password */}
      <label className="input validator">
        {/* ... SVG Password ... */}
        <input
          type="password"
          required
          placeholder="Password"
          value={password} // Controlled Input
          onChange={(e) => setPassword(e.target.value)} // Update State
          // Atribut pattern dan title tetap dipertahankan
          minlength="8"
        />
      </label>
      {loginError && <p className="text-error text-sm mt-1">{loginError}</p>}

      {/* Tombol Submit */}
      <button
        type="submit"
        className="btn btn-neutral w-[320px]" // Perbaikan: menggunakan className
        disabled={isLoading} // Mencegah double-click saat loading
      >
        {isLoading ? "Loading..." : "LOGIN"}
      </button>
    </form>
  );
};

export default Login;
