import { useEffect, useState } from "react";

import {
  getNotificationRecipients,
  sendNotification
} from "../api/notificationApi.js";

import Alert from "../components/Alert.jsx";


const TYPES = [
  "SYSTEM",
  "NEW_REPORT",
  "CASE_UPDATE",
  "REPORT_VERIFIED",
  "REPORT_REJECTED",
  "CHILD_FOUND"
];


export default function SendNotification({
  session
}) {

  const [recipients, setRecipients] =
    useState([]);

  const [recipientUserId, setRecipientUserId] =
    useState("");

  const [notificationType, setNotificationType] =
    useState("SYSTEM");

  const [caseId, setCaseId] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loadingRecipients, setLoadingRecipients] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  useEffect(() => {

    async function loadRecipients() {

      try {

        const data =
          await getNotificationRecipients();

        setRecipients(data);

      } catch (x) {

        setError(x.message);

      } finally {

        setLoadingRecipients(false);
      }
    }

    loadRecipients();

  }, []);


  async function submit(event) {

    event.preventDefault();

    setError("");
    setSuccess("");

    if (!recipientUserId) {

      setError(
        "Please select a recipient."
      );

      return;
    }


    if (!message.trim()) {

      setError(
        "Please enter a notification message."
      );

      return;
    }


    setSending(true);

    try {

      await sendNotification({

        recipientUserId:
          Number(recipientUserId),

        caseId:
          caseId.trim()
            ? Number(caseId)
            : null,

        notificationType,

        message: message.trim()

      });


      setSuccess(
        "Notification sent successfully."
      );


      setRecipientUserId("");
      setCaseId("");
      setMessage("");

    } catch (x) {

      setError(x.message);

    } finally {

      setSending(false);
    }
  }


  return (

    <main className="px-6 py-12">

      <div className="mx-auto max-w-2xl">

        <div className="mb-8">

          <span
            className="text-xs
                       font-bold
                       uppercase
                       tracking-wider
                       text-brand"
          >
            Notifications
          </span>

          <h1
            className="mt-2
                       text-3xl
                       font-bold
                       text-ink"
          >
            Send Notification
          </h1>

          <p
            className="mt-2
                       text-sm
                       text-muted"
          >
            Send an important notification to a
            registered user.
          </p>

        </div>


        <Alert
          msg={success}
        />

        <Alert
          msg={error}
          error
        />


        <form
          onSubmit={submit}
          className="rounded-2xl
                     border
                     border-black/10
                     bg-white
                     p-6
                     shadow-sm"
        >

          {/* Sender */}

          <div className="mb-5">

            <label
              className="mb-2
                         block
                         text-sm
                         font-bold
                         text-ink"
            >
              Sender
            </label>

            <div
              className="rounded-lg
                         border
                         border-black/10
                         bg-gray-50
                         px-4
                         py-3
                         text-sm"
            >

              {session?.name ||
                session?.username}

              <span
                className="ml-2
                           text-xs
                           font-semibold
                           text-brand"
              >
                ({session?.role})
              </span>

            </div>

          </div>


          {/* Recipient */}

          <div className="mb-5">

            <label
              htmlFor="recipient"
              className="mb-2
                         block
                         text-sm
                         font-bold
                         text-ink"
            >
              Recipient
            </label>

            <select
              id="recipient"
              value={recipientUserId}
              onChange={(event) =>
                setRecipientUserId(
                  event.target.value
                )
              }
              disabled={loadingRecipients}
              className="w-full
                         rounded-lg
                         border
                         border-black/10
                         bg-white
                         px-4
                         py-3
                         text-sm
                         outline-none
                         focus:border-brand"
            >

              <option value="">
                {loadingRecipients
                  ? "Loading users..."
                  : "Select a user"}
              </option>

              {recipients.map(
                recipient => (

                  <option
                    key={recipient.id}
                    value={recipient.id}
                  >
                    {recipient.name}
                    {" — "}
                    {recipient.username}
                  </option>

                )
              )}

            </select>

          </div>


          {/* Type */}

          <div className="mb-5">

            <label
              htmlFor="type"
              className="mb-2
                         block
                         text-sm
                         font-bold
                         text-ink"
            >
              Notification Type
            </label>

            <select
              id="type"
              value={notificationType}
              onChange={(event) =>
                setNotificationType(
                  event.target.value
                )
              }
              className="w-full
                         rounded-lg
                         border
                         border-black/10
                         bg-white
                         px-4
                         py-3
                         text-sm
                         outline-none
                         focus:border-brand"
            >

              {TYPES.map(type => (

                <option
                  key={type}
                  value={type}
                >
                  {type
                    .replaceAll("_", " ")
                    .replace(
                      /\b\w/g,
                      char =>
                        char.toUpperCase()
                    )}
                </option>

              ))}

            </select>

          </div>


          {/* Case ID */}

          <div className="mb-5">

            <label
              htmlFor="caseId"
              className="mb-2
                         block
                         text-sm
                         font-bold
                         text-ink"
            >
              Case ID
              <span
                className="ml-2
                           text-xs
                           font-normal
                           text-muted"
              >
                Optional
              </span>
            </label>

            <input
              id="caseId"
              type="number"
              value={caseId}
              onChange={(event) =>
                setCaseId(
                  event.target.value
                )
              }
              placeholder="Example: 1025"
              className="w-full
                         rounded-lg
                         border
                         border-black/10
                         px-4
                         py-3
                         text-sm
                         outline-none
                         focus:border-brand"
            />

          </div>


          {/* Message */}

          <div className="mb-6">

            <label
              htmlFor="message"
              className="mb-2
                         block
                         text-sm
                         font-bold
                         text-ink"
            >
              Message
            </label>

            <textarea
              id="message"
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              rows={5}
              maxLength={1000}
              placeholder="Enter the notification message..."
              className="w-full
                         resize-none
                         rounded-lg
                         border
                         border-black/10
                         px-4
                         py-3
                         text-sm
                         outline-none
                         focus:border-brand"
            />

            <p
              className="mt-1
                         text-right
                         text-xs
                         text-muted"
            >
              {message.length}/1000
            </p>

          </div>


          <button
            type="submit"
            disabled={sending}
            className="w-full
                       rounded-lg
                       bg-brand
                       px-5
                       py-3
                       text-sm
                       font-bold
                       text-white
                       transition
                       hover:bg-brand-dark
                       disabled:cursor-not-allowed
                       disabled:opacity-60"
          >
            {sending
              ? "Sending..."
              : "Send Notification"}
          </button>

        </form>

      </div>

    </main>
  );
}