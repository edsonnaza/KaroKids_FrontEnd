import { Button } from "../ui/button";
import ProductCart from "./ProductCart";
import { useEffect, useState } from "react";
import Carrousel from "../Home/Carrousel";
import axios from "axios";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const Cart = () => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
    customClass: {
      popup: "my-toast",
    },
  });
  const [preferenceId, setPreferenceId] = useState(null);
  const userLogued = useSelector((state) => state.users.user);
  const cart = userLogued.usuario_id
    ? useSelector((state) => state.carrito.cartDB)
    : useSelector((state) => state.carrito.cartLS);

  initMercadoPago("TEST-a5443a90-a45a-4830-a2c4-a2709cbae6ee", {
    locale: "es-AR",
  });

  const URL_PAYMENT = import.meta.env.VITE_URL_PAYMENT;

  const createPreference = async () => {
    try {
      const walletBrick = document.getElementById("walletBrick_container");
      if (walletBrick) return false;

      const response = await axios.post(`${URL_PAYMENT}`, {
        user_id: userLogued.usuario_id,
        cart,
      });

      const { id } = response.data;
      return id;
    } catch (error) {
      console.log(error);
    }
  };

  const handleMp = async () => {
    if (userLogued.usuario_id !== undefined) {
      const id = await createPreference();
      console.log(id);
      if (id) {
        setPreferenceId(id);
      }
    } else {
      Toast.fire({
        icon: "error",
        title: "Debes estar logueado para comprar",
      });
    }
  };

  const [anchoPantalla, setAnchoPantalla] = useState(window.innerWidth);

  useEffect(() => {
    window.scroll(0, 0);
    const manejarCambiosDeAncho = () => {
      setAnchoPantalla(window.innerWidth);
    };
    window.addEventListener("resize", manejarCambiosDeAncho);
    return () => {
      window.removeEventListener("resize", manejarCambiosDeAncho);
    };
  }, []);

  return (
    <article className="max-w-[1400px]  pt-28 md:pt-40 mx-auto">
      <header className="flex justify-between text-4xl font-semibold">
        <h2 className="text-2xl mx-2 xl:text-3xl">Mi carrito</h2>
      </header>
      <main className="flex flex-col items-center md:flex-row md:items-center  xl:items-start">
        <ProductCart />
        <div className="flex flex-col rounded-lg bg-slate-100  h-56 mb-0 items-start xl:mt-20  my-4 py-2 gap-y-6 w-80 md:w-[600px]  xl:justify-start xl:mx-4 xl:w-[900px] xl:h-[250px]">
          <h1 className="text-xl ml-2 font-semibold text-slate-700 text-left">
            Resumen de compra
          </h1>
          <div className="flex w-full h-full border-t-2 justify-center items-center">
            <h2 className="text-2xl h-20 mx-2 py-2 border-t-slate-300">
              Total: ${" "}
              {userLogued.usuario_id
                ? cart?.reduce(
                    (acc, el) => acc + el.producto_precio * el.compra_cantidad,
                    0
                  )
                : cart?.reduce(
                    (acc, el) => acc + el.unit_price * el.quantity,
                    0
                  )}
            </h2>
          </div>
          {anchoPantalla < 1024 ? (
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-xl z-50">
              <Button variant="detail" className="w-full" onClick={handleMp}>
                Completar compra
              </Button>
              {cart &&
                cart.length > 0 &&
                preferenceId &&
                userLogued.usuario_id && (
                  <Wallet initialization={{ preferenceId: preferenceId }} />
                )}
            </div>
          ) : (
            <>
              <div className="w-full">
                <Button
                  variant="detail"
                  className="w-full"
                  onClick={handleMp}
                  disabled={cart && cart?.length === 0}
                >
                  Completar compra
                </Button>
                {cart &&
                  cart.length > 0 &&
                  preferenceId &&
                  userLogued.usuario_id && (
                    <Wallet initialization={{ preferenceId: preferenceId }} />
                  )}
              </div>
            </>
          )}
        </div>
      </main>
      <Carrousel />
    </article>
  );
};

export default Cart;
