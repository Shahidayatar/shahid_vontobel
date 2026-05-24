import { AuthFrame } from "../components/AuthFrame";

export default function ForgotPasswordPage() {
  return (
    <AuthFrame title="Reset access" subtitle="Start an account recovery request for your enterprise workspace.">
      <form className="form-card">
        <label>
          Work email
          <input type="email" placeholder="you@company.com" />
        </label>
        <button className="primary-button" type="button">Send reset link</button>
      </form>
    </AuthFrame>
  );
}