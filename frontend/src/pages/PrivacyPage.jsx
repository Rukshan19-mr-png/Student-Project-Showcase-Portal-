import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="page-container page-container--narrow">
      <div className="page-header">
        <h1>Privacy Policy</h1>
        <p className="page-subtitle">Last updated: June 30, 2026</p>
      </div>

      <div className="static-content animate-fade-in">
        <section>
          <h2>1. Information We Collect</h2>
          <p>
            We collect basic information required to facilitate authentication and social networking on the platform:
          </p>
          <ul>
            <li><strong>Google Profile Info:</strong> Email, name, and avatar image when registering via Google OAuth.</li>
            <li><strong>Email Auth Info:</strong> Name, email address, role, and hashed password when using email registration.</li>
            <li><strong>Activity Data:</strong> Submissions, project likes, and follow connections are logged.</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Information</h2>
          <p>
            Your information is solely used to maintain your account session, customize the portfolio feed,
            and send notifications (e.g. notifying a student when a recruiter likes their project). We do not sell your data.
          </p>
        </section>

        <section>
          <h2>3. Cookies</h2>
          <p>
            We use secure `HttpOnly` cookie structures (`jwt`) to persist user session login data. These cookies
            are transmitted securely and cannot be accessed by client-side browser scripts, protecting against theft.
          </p>
        </section>

        <section>
          <h2>4. Data Deletion</h2>
          <p>
            Students can delete their projects at any time from the "My Projects" tab, which deletes all database records
            and thumbnail uploads permanently. To request complete account removal, please contact an administrator.
          </p>
        </section>

        <div className="static-footer">
          <Link to="/login" className="btn btn--secondary">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
