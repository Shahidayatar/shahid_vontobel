import { AuthFrame } from "../components/AuthFrame";

export default function LoginPage() {
  return (
    <AuthFrame title="Sign in to AI Foundry" subtitle="Use your enterprise identity to access the shared model catalog, agents, and tenant-isolated knowledge base.">
      <form className="form-card">
        <label>
          Work email
          <input type="email" placeholder="you@company.com" />
        </label>
        <label>
          Password
          <input type="password" placeholder="Enter your password" />
        </label>
        <button className="primary-button" type="button">Continue</button>
      </form>
    </AuthFrame>
  );
}