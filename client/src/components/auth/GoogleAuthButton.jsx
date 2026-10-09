import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

import { googleLogin } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function GoogleAuthButton() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await googleLogin(
        credentialResponse.credential
      );

      login(res.data, res.token);

      navigate("/dashboard");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Google sign-in failed"
      );
    }
  };

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return null;

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => alert("Google sign-in failed")}
        // This app receives Google's ID token in JavaScript and sends it
        // to the API. It does not use a browser redirect callback.
        ux_mode="popup"
        theme="filled_black"
        shape="pill"
        width="320"
      />
    </div>
  );
}

export default GoogleAuthButton;
