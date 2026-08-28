import { useEffect, useState } from "react";

import Layout from "./components/Layout.jsx";

import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Verify from "./pages/Verify.jsx";
import Forgot from "./pages/Forgot.jsx";
import Reset from "./pages/Reset.jsx";
import Profile from "./pages/Profile.jsx";

import NotificationTestHome from "./pages/NotificationTestHome.jsx";
import Notifications from "./pages/Notifications.jsx";
import SendNotification from "./pages/SendNotification.jsx";

import {
  get,
  TOKEN_KEY
} from "./api/client.js";


export default function App() {

  const [page, setPage] =
    useState("home");

  const [data, setData] =
    useState(null);

  const [session, setSession] =
    useState(null);

  const [checkingSession, setCheckingSession] =
    useState(true);


  const go = (pageName, pageData) => {

    setPage(pageName);
    setData(pageData);
  };


  useEffect(() => {

    document.body.classList.add(
      "page-ready"
    );


    const token =
      localStorage.getItem(
        TOKEN_KEY
      );


    if (!token) {

      setCheckingSession(false);
      return;
    }


    get(
      "/user/profile",
      token
    )
      .then(profile => {

        setSession({
          token,
          ...profile
        });

      })
      .catch(error => {

        if (!error.networkError) {

          localStorage.removeItem(
            TOKEN_KEY
          );

          setSession(null);
        }

      })
      .finally(() => {

        setCheckingSession(false);
      });

  }, []);


  function logout() {

    localStorage.removeItem(
      TOKEN_KEY
    );

    setSession(null);

    go("home");
  }


  if (checkingSession) {

    return (

      <Layout
        session={session}
        onHome={() => go("home")}
        onNotifications={() =>
          go("notifications")
        }
        onSendNotification={() =>
          go("send-notification")
        }
        onProfile={() =>
          go("profile")
        }
        onLogout={logout}
      >

        <main
          className="grid
                     min-h-[60vh]
                     place-items-center
                     px-6"
        >

          <p
            className="text-sm
                       text-muted"
          >
            Checking session...
          </p>

        </main>

      </Layout>
    );
  }


  if (page === "home") {

    return (
      <Home go={go} />
    );
  }


  return (

    <Layout
      session={session}

      onHome={() =>
        go("home")
      }

      onNotifications={() =>
        go("notifications")
      }

      onSendNotification={() =>
        go("send-notification")
      }

      onProfile={() =>
        go("profile")
      }

      onLogout={logout}
    >

      {page === "register" && (
        <Register go={go} />
      )}


      {page === "login" && (

        <Login
          go={go}
          setSession={setSession}
        />

      )}


      {page === "verify" && (

        <Verify
          email={data}
          go={go}
        />

      )}


      {page === "forgot" && (
        <Forgot go={go} />
      )}


      {page === "reset" && (

        <Reset
          email={data}
          go={go}
        />

      )}


      {page === "profile" && (

        <Profile
          clear={() =>
            setSession(null)
          }
          go={go}
        />

      )}


      {page === "notification-test" && (

        <NotificationTestHome
          session={session}

          onNotifications={() =>
            go("notifications")
          }
        />

      )}


      {page === "notifications" && (

        <Notifications
          session={session}
        />

      )}


      {page === "send-notification" && (

        <SendNotification
          session={session}
        />

      )}

    </Layout>
  );
}