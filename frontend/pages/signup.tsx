import { AuthFrame } from "../components/AuthFrame";

export default function SignupPage() {
  return (
    <AuthFrame title="Create workspace access" subtitle="Request access to a tenant workspace and provision your enterprise AI identity.">
      <form className="form-card">
        <label>
          Full name
          <input type="text" placeholder="Jane Doe" />
        </label>
        <label>
          Work email
          <input type="email" placeholder="jane@company.com" />
        </label>
        <label>
          Role
          <select defaultValue="ai-developer">
            <option value="admin">Admin</option>
            <option value="platform-engineer">Platform Engineer</option>
            <option value="ai-developer">AI Developer</option>
            <option value="viewer">Viewer</option>
          </select>
        </label>
        <button className="primary-button" type="button">Request access</button>
      </form>
    </AuthFrame>
  );
}