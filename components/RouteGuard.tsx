import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

export default function RouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuth, setIsAuth] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      const authenticated = false;
      setIsAuth(authenticated);
      setIsReady(true);
    }, 100);
  }, []);

  useEffect(() => {
    if (isReady && !isAuth) {
      router.replace("/auth");
    }
  }, [isReady, isAuth]);

  if (!isReady) return null;
  // if (!isAuth) return null;

  return <>{children}</>;
}
