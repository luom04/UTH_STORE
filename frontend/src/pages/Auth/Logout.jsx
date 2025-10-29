// src/pages/Auth/Logout.jsx
import { useEffect, useRef } from "react";
import { useLogout } from "../../hooks/useAuth";
import FullPageLoader from "../../components/Common/FullPageLoader";

export default function Logout() {
  const { mutate } = useLogout(); // dùng mutate, KHÔNG cần navigate ở đây
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // chặn StrictMode gọi 2 lần
    ran.current = true;
    mutate(); // hook sẽ toast + navigate
  }, [mutate]);

  return <FullPageLoader />;
}
