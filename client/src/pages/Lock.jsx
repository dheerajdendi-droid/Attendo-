import { useEffect, useRef, useState } from "react";
import PinPad from "../components/PinPad.jsx";
import { useLogin, useSetupPin, useGoogleLogin, useFacebookLogin } from "../lib/useAuth.js";

const PIN_LENGTH = 4;

// Both SDK scripts load async in index.html, so on mount we poll briefly for
// them to be ready rather than assuming they're already attached to window.
function useReady(check, deps = []) {
  const [ready, setReady] = useState(check());
  useEffect(() => {
    if (ready) return;
    const id = setInterval(() => {
      if (check()) {
        setReady(true);
        clearInterval(id);
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ready;
}

export default function Lock({ pinSet, studioName }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [stage, setStage] = useState("enter"); // enter | confirm
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const googleButtonRef = useRef(null);

  const login = useLogin();
  const setup = useSetupPin();
  const googleLogin = useGoogleLogin();
  const facebookLogin = useFacebookLogin();

  const googleReady = useReady(() => !!window.google?.accounts?.id);
  const facebookReady = useReady(() => !!window.FB);

  const busy = login.isPending || setup.isPending;
  const activeValue = pinSet ? pin : stage === "enter" ? pin : confirmPin;

  function triggerError(message) {
    setError(message);
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setPin("");
    setConfirmPin("");
    setStage("enter");
  }

  useEffect(() => {
    if (pinSet && pin.length === PIN_LENGTH) {
      login.mutate(pin, {
        onError: (err) => triggerError(err.message || "Incorrect PIN"),
        onSuccess: () => setError(""),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, pinSet]);

  useEffect(() => {
    if (!pinSet && stage === "enter" && pin.length === PIN_LENGTH) {
      setFirstPin(pin);
      setStage("confirm");
    }
  }, [pin, pinSet, stage]);

  useEffect(() => {
    if (!pinSet && stage === "confirm" && confirmPin.length === PIN_LENGTH) {
      if (confirmPin !== firstPin) {
        triggerError("PINs didn't match — try again");
        setFirstPin("");
        return;
      }
      setup.mutate(confirmPin, {
        onError: (err) => triggerError(err.message || "Something went wrong"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmPin, pinSet, stage, firstPin]);

  useEffect(() => {
    if (!googleReady || !import.meta.env.VITE_GOOGLE_CLIENT_ID || !googleButtonRef.current) return;
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: (response) => {
        setError("");
        googleLogin.mutate(response.credential, {
          onError: (err) => setError(err.message || "Google sign-in failed"),
        });
      },
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      width: 260,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleReady]);

  useEffect(() => {
    if (!facebookReady || !import.meta.env.VITE_FACEBOOK_APP_ID) return;
    window.FB.init({
      appId: import.meta.env.VITE_FACEBOOK_APP_ID,
      cookie: true,
      xfbml: false,
      version: "v21.0",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facebookReady]);

  function facebookSignIn() {
    setError("");
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          facebookLogin.mutate(response.authResponse.accessToken, {
            onError: (err) => setError(err.message || "Facebook sign-in failed"),
          });
        }
      },
      { scope: "email" }
    );
  }

  function handleChange(next) {
    setError("");
    if (pinSet) {
      setPin(next);
    } else if (stage === "enter") {
      setPin(next);
    } else {
      setConfirmPin(next);
    }
  }

  const heading = pinSet
    ? "Enter your PIN"
    : stage === "enter"
    ? "Set up a PIN"
    : "Confirm your PIN";

  const subheading = pinSet
    ? "Welcome back"
    : "Choose a 4-digit PIN to lock the app";

  const showSocial = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_FACEBOOK_APP_ID;

  return (
    <div className="min-h-screen bg-ink-900 flex flex-col items-center justify-center px-6 text-ink-100">
      <div className="text-center mb-10">
        <p className="font-display text-3xl font-semibold text-gold-500">{studioName || "Attendo"}</p>
        <h1 className="mt-3 text-lg font-medium">{heading}</h1>
        <p className="text-sm text-ink-200/70 mt-1">{subheading}</p>
      </div>
      <div className={shake ? "animate-[shake_0.4s]" : ""}>
        <PinPad value={activeValue} maxLength={PIN_LENGTH} onChange={handleChange} disabled={busy} />
      </div>
      <p className="mt-6 h-5 text-danger-500 text-sm font-medium">{error}</p>

      {showSocial && (
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 w-full max-w-[260px]">
            <div className="flex-1 h-px bg-ink-200/20" />
            <span className="text-xs text-ink-200/50">or</span>
            <div className="flex-1 h-px bg-ink-200/20" />
          </div>
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && <div ref={googleButtonRef} />}
          {import.meta.env.VITE_FACEBOOK_APP_ID && (
            <button
              onClick={facebookSignIn}
              disabled={!facebookReady}
              className="min-h-[44px] w-[260px] rounded-xl bg-[#1877F2] text-white font-medium text-sm"
            >
              Continue with Facebook
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
